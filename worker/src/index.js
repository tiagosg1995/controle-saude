// ======================================================
// CONTROLE SAÚDE - CLOUDFLARE WORKER
// Gerencia lembretes de água via PushAlert REST API
//
// KV schema:
//   key: "lembrete:{subscriberId}"
//   value: JSON { subscriberId, intervaloHoras, ultimoEnvio (ISO) }
//
// Rotas:
//   POST   /registrar  { subscriberId, intervaloHoras }
//   DELETE /cancelar   { subscriberId }
//
// Cron: */30 * * * *  — verifica quem precisa receber notificação
// ======================================================

const PUSHALERT_API = "https://api.pushalert.co/rest/v1";
const ORIGIN_PERMITIDA = "https://tiagosg1995.github.io";

// ======================================================
// CORS
// ======================================================

function corsHeaders(origin) {
    const allowed = origin === ORIGIN_PERMITIDA || origin === "http://localhost" || (origin && origin.startsWith("http://localhost:"));
    return {
        "Access-Control-Allow-Origin": allowed ? origin : ORIGIN_PERMITIDA,
        "Access-Control-Allow-Methods": "POST, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    };
}

function jsonResponse(data, status = 200, origin = "") {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            "Content-Type": "application/json",
            ...corsHeaders(origin),
        },
    });
}

// ======================================================
// PUSHALERT — enviar notificação para um subscriber
// ======================================================

async function enviarNotificacao(subscriberId, apiKey) {
    const body = new URLSearchParams({
        subscriber_id: subscriberId,
        title: "💧 Hora de beber água",
        message: "Sua hidratação é importante! Beba água agora.",
        icon: "https://tiagosg1995.github.io/controle-saude/icone-192.png",
        url: "https://tiagosg1995.github.io/controle-saude/",
    });

    const res = await fetch(`${PUSHALERT_API}/send`, {
        method: "POST",
        headers: {
            Authorization: `api_key=${apiKey}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
    });

    return res.json();
}

// ======================================================
// CRON — roda a cada 30 minutos
// ======================================================

async function processarCron(env) {
    const { keys } = await env.LEMBRETES.list({ prefix: "lembrete:" });

    if (!keys.length) return;

    const agora = new Date();

    await Promise.all(
        keys.map(async ({ name }) => {
            const raw = await env.LEMBRETES.get(name);
            if (!raw) return;

            const lembrete = JSON.parse(raw);
            const { subscriberId, intervaloHoras, ultimoEnvio } = lembrete;

            const ultimo = new Date(ultimoEnvio);
            const diffHoras = (agora - ultimo) / (1000 * 60 * 60);

            if (diffHoras >= intervaloHoras) {
                await enviarNotificacao(subscriberId, env.PUSHALERT_API_KEY);

                await env.LEMBRETES.put(
                    name,
                    JSON.stringify({ ...lembrete, ultimoEnvio: agora.toISOString() })
                );
            }
        })
    );
}

// ======================================================
// ROTAS HTTP
// ======================================================

async function handleRegistrar(request, env) {
    const origin = request.headers.get("Origin") || "";
    let body;

    try {
        body = await request.json();
    } catch {
        return jsonResponse({ erro: "Body inválido." }, 400, origin);
    }

    const { subscriberId, intervaloHoras } = body;

    if (!subscriberId || !intervaloHoras) {
        return jsonResponse({ erro: "subscriberId e intervaloHoras são obrigatórios." }, 400, origin);
    }

    if (intervaloHoras < 0.5 || intervaloHoras > 24) {
        return jsonResponse({ erro: "intervaloHoras deve ser entre 0.5 e 24." }, 400, origin);
    }

    const lembrete = {
        subscriberId,
        intervaloHoras,
        ultimoEnvio: new Date().toISOString(),
    };

    await env.LEMBRETES.put(
        `lembrete:${subscriberId}`,
        JSON.stringify(lembrete),
        { expirationTtl: 60 * 60 * 24 * 365 }
    );

    return jsonResponse({ ok: true, mensagem: `Lembrete ativado a cada ${intervaloHoras}h.` }, 200, origin);
}

async function handleCancelar(request, env) {
    const origin = request.headers.get("Origin") || "";
    let body;

    try {
        body = await request.json();
    } catch {
        return jsonResponse({ erro: "Body inválido." }, 400, origin);
    }

    const { subscriberId } = body;

    if (!subscriberId) {
        return jsonResponse({ erro: "subscriberId é obrigatório." }, 400, origin);
    }

    await env.LEMBRETES.delete(`lembrete:${subscriberId}`);

    return jsonResponse({ ok: true, mensagem: "Lembrete cancelado." }, 200, origin);
}

// ======================================================
// HANDLER PRINCIPAL
// ======================================================

export default {

    async fetch(request, env) {
        const origin = request.headers.get("Origin") || "";
        const { pathname } = new URL(request.url);

        if (request.method === "OPTIONS") {
            return new Response(null, { status: 204, headers: corsHeaders(origin) });
        }

        if (pathname === "/registrar" && request.method === "POST") {
            return handleRegistrar(request, env);
        }

        if (pathname === "/cancelar" && request.method === "DELETE") {
            return handleCancelar(request, env);
        }

        return jsonResponse({ erro: "Rota não encontrada." }, 404, origin);
    },

    async scheduled(event, env) {
        await processarCron(env);
    },
};
