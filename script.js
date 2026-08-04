// ======================================================
// CONTROLE SAÚDE
// SCRIPT.JS - VERSÃO 2.0
// Parte 1/4
// ======================================================

"use strict";

// ======================================================
// CONFIGURAÇÕES
// ======================================================

const META_PADRAO = 2000;

// ======================================================
// DATA ATUAL
// ======================================================

let dataAtual = new Date().toISOString().split("T")[0];

// ======================================================
// STORAGE
// ======================================================

let dados =
JSON.parse(localStorage.getItem("controleSaude")) || {};

let horariosComida =
JSON.parse(localStorage.getItem("horariosComida")) || [];


let remedios =
JSON.parse(localStorage.getItem("remedios")) || [];

let metaAgua =
Number(localStorage.getItem("metaAgua")) || META_PADRAO;

// ======================================================
// SALVAR
// ======================================================

function salvarDados(){

    localStorage.setItem(
        "controleSaude",
        JSON.stringify(dados)
    );

}

function salvarHorarios(){

    localStorage.setItem(
        "horariosComida",
        JSON.stringify(horariosComida)
    );

}
function salvarRemedios(){

    localStorage.setItem(

        "remedios",

        JSON.stringify(remedios)

    );

}
// ======================================================
// CRIAR DIA
// ======================================================

function criarDia(){

    if(!dados[dataAtual]){

        dados[dataAtual]={

            agua:0,

            historicoAgua:[],

            refeicoes:[]

        };

        salvarDados();

    }

}

// ======================================================
// ELEMENTOS
// ======================================================

function $(id){

    return document.getElementById(id);

}

// ======================================================
// USUÁRIO
// ======================================================

function verificarUsuario(){

    const nome =
    localStorage.getItem("nomeUsuario");

    if(nome){

        if($("telaBoasVindas")){

            $("telaBoasVindas")
            .classList.add("ocultar");

        }

        if($("boasVindas")){

            $("boasVindas").innerHTML =
            ` Olá, <b>${nome}</b>`;

        }

        if($("novoNome")){

            $("novoNome").value = nome;

        }

    }

}

function salvarNome(){

    const nome =
    $("nomeUsuario").value.trim();

    if(nome===""){

        alert("Digite seu nome.");

        return;

    }

    localStorage.setItem(
        "nomeUsuario",
        nome
    );

    verificarUsuario();

}

function alterarNome(){

    const nome =
    $("novoNome").value.trim();

    if(nome===""){

        alert("Digite um nome.");

        return;

    }

    localStorage.setItem(
        "nomeUsuario",
        nome
    );

    verificarUsuario();

    alert("Nome alterado!");

}

// ======================================================
// META DE ÁGUA
// ======================================================

function salvarMetaAgua(){

    const valor =
    Number($("metaAgua").value);

    if(valor<=0){

        alert("Informe uma meta válida.");

        return;

    }

    metaAgua = valor;

    localStorage.setItem(
        "metaAgua",
        valor
    );

    atualizarDashboard();

    alert("Meta salva com sucesso.");

}

// ======================================================
// TEMA
// ======================================================

function carregarTema(){

    const tema =
    localStorage.getItem("tema") || "light";

    const botao =
    $("btnTema");

    if(tema==="dark"){

        document.body.classList.add("dark");

        if(botao){

            botao.innerHTML =
            '<i class="bi bi-sun-fill"></i>';

        }

    }else{

        document.body.classList.remove("dark");

        if(botao){

            botao.innerHTML =
            '<i class="bi bi-moon-stars-fill"></i>';

        }

    }

}

function alternarTema(){

    document.body.classList.toggle("dark");

    const escuro =
    document.body.classList.contains("dark");

    localStorage.setItem(
        "tema",
        escuro ? "dark" : "light"
    );

    const botao =
    $("btnTema");

    if(botao){

        botao.innerHTML = escuro
        ? '<i class="bi bi-sun-fill"></i>'
        : '<i class="bi bi-moon-stars-fill"></i>';

    }

}

// ======================================================
// TROCAR DIA
// ======================================================

function trocarDia(){

    dataAtual =
    $("dataSelecionada").value;

    criarDia();

    mostrarDados();

}


// ======================================================
// CONTROLE DE ÁGUA
// PARTE 2/4
// ======================================================

// Adicionar água
function adicionarAgua(ml){

    criarDia();

    dados[dataAtual].agua += ml;

    const hora = new Date().toLocaleTimeString("pt-BR",{
        hour:"2-digit",
        minute:"2-digit"
    });

    dados[dataAtual].historicoAgua.push({
        quantidade: ml,
        hora: hora
    });

    salvarDados();

    mostrarDados();

}

// Água personalizada
function adicionarAguaPersonalizada(){

    const campo = $("aguaPersonalizada");

    if(!campo) return;

    const ml = Number(campo.value);

    if(isNaN(ml) || ml <= 0){

        alert("Digite uma quantidade válida.");

        return;

    }

    adicionarAgua(ml);

    campo.value = "";

}

// Limpar água
function zerarAgua(){

    if(!confirm("Deseja apagar toda a água deste dia?"))
        return;

    criarDia();

    dados[dataAtual].agua = 0;

    dados[dataAtual].historicoAgua = [];

    salvarDados();

    mostrarDados();

}

// Excluir um registro
function apagarHistoricoAgua(indice){

    if(!confirm("Excluir este registro?"))
        return;

    criarDia();

    const registro =
    dados[dataAtual].historicoAgua[indice];

    if(registro){

        dados[dataAtual].agua -= registro.quantidade;

        if(dados[dataAtual].agua < 0){

            dados[dataAtual].agua = 0;

        }

    }

    dados[dataAtual].historicoAgua.splice(indice,1);

    salvarDados();

    mostrarDados();

}

// ======================================================
// DASHBOARD
// ======================================================

function atualizarDashboard(){

    criarDia();

    const agua = dados[dataAtual].agua;

    let percentual =
    (agua/metaAgua)*100;

    if(percentual>100)
        percentual=100;

    // Água hoje

    if($("dashAgua")){

        $("dashAgua").innerHTML =
        `${agua} / ${metaAgua} ml`;

    }

    // Barra

    if($("progressoAgua")){

        $("progressoAgua").style.width =
        percentual+"%";

    }

    // Percentual

    if($("percentualAgua")){

        $("percentualAgua").innerHTML =
        `${Math.round(percentual)}% da meta`;

    }

    // Mensagem inteligente

    if($("statusAgua")){

        let texto = "";

        if(agua==0){

            texto =
            " Comece seu dia bebendo água.";

        }

        else if(percentual<25){

            texto =
            " Bom começo! Continue hidratando-se.";

        }

        else if(percentual<50){

            texto =
            " Você está indo muito bem!";

        }

        else if(percentual<75){

            texto =
            " Mais da metade concluída!";

        }

        else if(percentual<100){

            texto =
            ` Faltam apenas ${metaAgua-agua} ml`;

        }

        else{

            texto =
            " Parabéns! Meta concluída.";

        }

        $("statusAgua").innerHTML = texto;

    }

    // Card brilhando

    const card =
    document.querySelector(".dashboard .card");

    if(card){

        if(agua>=metaAgua){

            card.classList.add("metaCompleta");

        }else{

            card.classList.remove("metaCompleta");

        }

    }

    // Refeições

    if($("dashRefeicoes")){

        $("dashRefeicoes").innerHTML =
        dados[dataAtual].refeicoes.length;

    }

    calcularSequencia();

}

// ======================================================
// HISTÓRICO DE ÁGUA
// ======================================================

function atualizarHistoricoAgua(){

    if(!$("historicoAgua"))
        return;

    let html="";

    dados[dataAtual]
    .historicoAgua
    .forEach((item,index)=>{

        html += `

<li>

<div>

 <strong>${item.quantidade} ml</strong>

<br>

<small>${item.hora}</small>

</div>

<button
class="btnExcluir"
onclick="apagarHistoricoAgua(${index})">

<i class="bi bi-x-lg"></i>

</button>

</li>

`;

    });

    $("historicoAgua").innerHTML = html;

}

// ======================================================
// QUANTIDADE
// ======================================================

function atualizarQuantidadeAgua(){

    if(!$("quantidadeAgua"))
        return;

    const ml =
    dados[dataAtual].agua;

    const copos =
    (ml/250).toFixed(1);

    $("quantidadeAgua").innerHTML =
    `${ml} ml (${copos} copos)`;

}
// ======================================================
// REFEIÇÕES
// PARTE 3/4
// ======================================================

function registrarRefeicao(){

    criarDia();

    const select = $("refeicao");

    if(!select) return;

    const nome = select.value;

    const hora = new Date().toLocaleTimeString("pt-BR",{
        hour:"2-digit",
        minute:"2-digit"
    });

    dados[dataAtual].refeicoes.push({
        nome:nome,
        hora:hora
    });

    salvarDados();

    mostrarDados();

}

// ======================================================

function apagarRefeicao(index){

    if(!confirm("Excluir esta refeição?"))
        return;

    criarDia();

    dados[dataAtual].refeicoes.splice(index,1);

    salvarDados();

    mostrarDados();

}

// ======================================================

function limparRefeicoes(){

    if(!confirm("Apagar todas as refeições deste dia?"))
        return;

    criarDia();

    dados[dataAtual].refeicoes=[];

    salvarDados();

    mostrarDados();

}

// ======================================================
// HISTÓRICO DE REFEIÇÕES
// ======================================================

function atualizarHistoricoRefeicoes(){

    if(!$("historicoRefeicao"))
        return;

    let html="";

    dados[dataAtual].refeicoes.forEach((item,index)=>{

        html += `

<li>

<div>

 <strong>${item.nome}</strong>

<br>

<small>${item.hora}</small>

</div>

<button
class="btnExcluir"
onclick="apagarRefeicao(${index})">

<i class="bi bi-x-lg"></i>

</button>

</li>

`;

    });

    $("historicoRefeicao").innerHTML = html;

}

// ======================================================
// HORÁRIOS
// ======================================================

async function criarNotificacaoRefeicao(horario){

    if(!possuiCapacitor()){

        console.log("Capacitor não encontrado");
        return;

    }


    const permissao =
    await Capacitor.Plugins.LocalNotifications.requestPermissions();


    if(permissao.display !== "granted"){

        alert("Permissão de notificação negada.");
        return;

    }


    const partes = horario.split(":");


    const data = new Date();

    data.setHours(
        Number(partes[0]),
        Number(partes[1]),
        0,
        0
    );


    if(data <= new Date()){

        data.setDate(
            data.getDate()+1
        );

    }


    await Capacitor.Plugins.LocalNotifications.schedule({

        notifications:[{

            id:Number(Date.now().toString().slice(-6)),

            title:"🍽 Hora da refeição",

            body:"Está na hora da sua refeição.",

            schedule:{
                at:data
            }

        }]

    });


    console.log(
        "Refeição agendada:",
        data
    );

}

// ======================================================

// ======================================================
// CRIAR NOTIFICAÇÃO DO REMÉDIO
// ======================================================

async function criarNotificacaoRemedio(remedio){

    if(!possuiCapacitor()){

        console.log("Capacitor não encontrado");

        return;

    }

    const permissao =
    await Capacitor.Plugins.LocalNotifications.requestPermissions();

    if(permissao.display !== "granted"){

        alert("Permissão de notificação negada.");

        return;

    }

    const partes =
    remedio.hora.split(":");

    const data =
    new Date();

    data.setHours(

        Number(partes[0]),

        Number(partes[1]),

        0,

        0

    );

    if(data <= new Date()){

        data.setDate(

            data.getDate()+1

        );

    }

    await Capacitor.Plugins.LocalNotifications.schedule({

        notifications:[{

            id:remedio.id,

            title:"💊 Hora do Remédio",

            body:`${remedio.nome}${remedio.dose ? " - "+remedio.dose : ""}`,

            schedule:{

                at:data,

                repeats:true

            }

        }]

    });

}

function removerHorario(index){

    if(!confirm("Remover este horário?"))
        return;

    horariosComida.splice(index,1);

    salvarHorarios();

    mostrarHorarios();

}

// ======================================================
// ======================================================
// ADICIONAR HORÁRIO DE REFEIÇÃO
// ======================================================

async function adicionarComida(){

    const campo = $("horaComida");

    if(!campo){
        return;
    }


    const horario = campo.value;


    if(horario === ""){

        alert("Escolha um horário.");

        return;

    }


    // evita horário duplicado
    if(horariosComida.includes(horario)){

        alert("Esse horário já foi adicionado.");

        return;

    }


    horariosComida.push(horario);


    salvarHorarios();


    mostrarHorarios();


    campo.value="";


    // tenta criar a notificação
    await criarNotificacaoRefeicao(horario);


    alert("Horário adicionado com sucesso!");

}
function mostrarHorarios(){

    if(!$("listaComida"))
        return;

    let html="";

    horariosComida.forEach((hora,index)=>{

        html += `

<li>

<div>

 ${hora}

</div>

<button
class="btnExcluir"
onclick="removerHorario(${index})">

<i class="bi bi-x-lg"></i>

</button>

</li>

`;

    });

    $("listaComida").innerHTML = html;

}

// ======================================================
// RESUMO
// ======================================================

function atualizarResumo(){

    criarDia();

    if($("resumoData")){

        $("resumoData").innerHTML =
        dataAtual.split("-").reverse().join("/");

    }

    if($("resumoAgua")){

        $("resumoAgua").innerHTML =
        dados[dataAtual].agua+" ml";

    }

    if($("resumoRefeicoes")){

        $("resumoRefeicoes").innerHTML =
        dados[dataAtual].refeicoes.length;

    }

    // Lista

    if($("listaResumo")){

        let html="";

        dados[dataAtual].refeicoes.forEach(item=>{

            html+=`

<li>

 ${item.nome}

<span>${item.hora}</span>

</li>

`;

        });

        $("listaResumo").innerHTML=html;

    }

    // Horários

    if($("proximosHorarios")){

        let html="";

        horariosComida.forEach(h=>{

            html+=`

<li>

 ${h}

</li>

`;

        });

        $("proximosHorarios").innerHTML=html;

    }

}

// ======================================================
// SEQUÊNCIA
// ======================================================

function calcularSequencia(){

    let dias=0;

    let data = new Date();

    while(true){

        const chave =
        data.toISOString().split("T")[0];

        if(
            dados[chave] &&
            (
                dados[chave].agua>0 ||
                dados[chave].refeicoes.length>0
            )
        ){

            dias++;

            data.setDate(
                data.getDate()-1
            );

        }else{

            break;

        }

    }

    if($("sequenciaDias")){

        $("sequenciaDias").innerHTML=dias;

    }

}

// ======================================================
// MOSTRAR DADOS
// ======================================================

function mostrarDados(){

    criarDia();

    atualizarQuantidadeAgua();

    atualizarHistoricoAgua();

    atualizarHistoricoRefeicoes();

    atualizarDashboard();

    atualizarResumo();

    mostrarHorarios();

    atualizarResumoRemedios();

}

// ======================================================
// NAVEGAÇÃO ENTRE TELAS
// ======================================================

function abrirTela(id, botao){

    document.querySelectorAll(".tela").forEach(tela=>{

        tela.classList.remove("ativa");

    });

    const tela = $(id);

    if(tela){

        tela.classList.add("ativa");

    }

    document.querySelectorAll(".menu button").forEach(btn=>{

        btn.classList.remove("ativo");

    });

    if(botao){

        botao.classList.add("ativo");

    }

    window.scrollTo({

        top:0,

        behavior:"smooth"

    });

}



// ======================================================
// VERIFICA SE ESTÁ RODANDO NO CAPACITOR
// ======================================================

function possuiCapacitor(){

    return (

        typeof Capacitor !== "undefined" &&

        Capacitor.Plugins &&

        Capacitor.Plugins.LocalNotifications

    );

}


// ======================================================
// CONFIGURAÇÃO DO WORKER
// ======================================================

const WORKER_URL = "https://controle-saude-worker.mateusswsw.workers.dev";


// ======================================================
// VERIFICA SE O NAVEGADOR SUPORTA WEB NOTIFICATIONS
// ======================================================

function possuiWebNotificacoes(){

    return "Notification" in window;

}


// ======================================================
// OBTÉM O SUBSCRIBER ID DO PUSHALERT
// ======================================================

function obterPushAlertSubscriberId(){

    return window.PushAlertCo && window.PushAlertCo.subs_id
        ? String(window.PushAlertCo.subs_id)
        : null;

}


// ======================================================
// LEMBRETE DE ÁGUA VIA CLOUDFLARE WORKER + PUSHALERT
// ======================================================

async function _ativarLembreteWorker(subscriberId, intervaloHoras){

    const res = await fetch(`${WORKER_URL}/registrar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriberId, intervaloHoras }),
    });

    if(!res.ok){
        const err = await res.json().catch(() => ({}));
        throw new Error(err.erro || "Erro ao registrar lembrete.");
    }

    localStorage.setItem(
        "lembreteAguaWorker",
        JSON.stringify({ subscriberId, intervaloHoras })
    );

}

async function _cancelarLembreteWorker(subscriberId){

    await fetch(`${WORKER_URL}/cancelar`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriberId }),
    }).catch(() => {});

    localStorage.removeItem("lembreteAguaWorker");

}


// ======================================================
// LEMBRETE DE ÁGUA VIA WEB NOTIFICATIONS API (FALLBACK)
// ======================================================

let _intervaloAguaTimer = null;

function _iniciarTimerAguaPWA(intervaloMs){

    clearInterval(_intervaloAguaTimer);

    _intervaloAguaTimer = setInterval(async () => {

        const reg = navigator.serviceWorker?.controller
            ? await navigator.serviceWorker.ready
            : null;

        if(reg){

            reg.showNotification("💧 Hora de beber água", {
                body: "Sua hidratação é importante!",
                icon: "./icone-192.png"
            });

        } else if(Notification.permission === "granted"){

            new Notification("💧 Hora de beber água", {
                body: "Sua hidratação é importante!",
                icon: "./icone-192.png"
            });

        }

    }, intervaloMs);

}

function _restaurarLembreteAguaPWA(){

    const salvo = localStorage.getItem("lembreteAguaPWA");

    if(!salvo) return;

    const { intervaloMs } = JSON.parse(salvo);

    if(Notification.permission === "granted"){

        _iniciarTimerAguaPWA(intervaloMs);

    }

}

function _cancelarLembreteAguaPWA(){

    clearInterval(_intervaloAguaTimer);

    _intervaloAguaTimer = null;

    localStorage.removeItem("lembreteAguaPWA");

}



// ======================================================
// TESTE DE NOTIFICAÇÃO
// ======================================================
async function testarNotificacao(){

    const permissao =
    await LocalNotifications.requestPermissions();


    console.log(permissao);


    if(permissao.display !== "granted"){

        alert("Permissão negada");

        return;

    }


    await LocalNotifications.schedule({

        notifications:[

            {

                id:1,

                title:"💜 Controle Saúde",

                body:"Teste de notificação funcionando!",

                schedule:{
                    at:new Date(Date.now()+5000)
                }

            }

        ]

    });


    alert("Notificação criada!");

}

// ======================================================
// LEMBRETE DE ÁGUA
// ======================================================
async function lembreteAgua(){

    const intervalo =
    Number($("intervaloAgua").value);


    if(!intervalo){

        alert("Escolha um intervalo.");

        return;

    }


    if(possuiCapacitor()){

        const permissao =
        await Capacitor.Plugins.LocalNotifications.requestPermissions();

        if(permissao.display !== "granted"){

            alert("Permissão negada.");

            return;

        }

        // Remove lembrete antigo da água
        await Capacitor.Plugins.LocalNotifications.cancel({
            notifications:[{ id:10 }]
        });

        const agora = new Date();

        agora.setHours(agora.getHours()+1);

        await Capacitor.Plugins.LocalNotifications.schedule({

            notifications:[{

                id:10,

                title:"💧 Hora de beber água",

                body:"Sua hidratação é importante!",

                schedule:{

                    at:agora,

                    repeats:true,

                    every:"hour",

                    count: intervalo / 60

                }

            }]

        });

        alert(`Lembrete ativado a cada ${intervalo/60} hora(s).`);

    } else if(possuiWebNotificacoes()){

        const permissao =
        await Notification.requestPermission();

        if(permissao !== "granted"){

            alert("Permissão de notificação negada.");

            return;

        }

        // Tenta usar o Worker + PushAlert (funciona com app fechado)
        const subscriberId = obterPushAlertSubscriberId();

        if(subscriberId){

            try {

                await _ativarLembreteWorker(subscriberId, intervalo / 60);

                _cancelarLembreteAguaPWA();

                alert(`Lembrete ativado a cada ${intervalo/60} hora(s). ✅ Funciona mesmo com o app fechado!`);

                return;

            } catch(e){

                console.warn("Worker indisponível, usando fallback local:", e);

            }

        }

        // Fallback: setInterval local (app precisa estar aberto)
        const intervaloMs = intervalo * 1000;

        _cancelarLembreteAguaPWA();

        _iniciarTimerAguaPWA(intervaloMs);

        localStorage.setItem(
            "lembreteAguaPWA",
            JSON.stringify({ intervaloMs })
        );

        alert(`Lembrete ativado a cada ${intervalo/60} hora(s).\n⚠️ O lembrete funciona enquanto o app estiver aberto.`);

    } else {

        alert("Notificações não são suportadas neste navegador.");

    }

}



// ======================================================
// REAGENDAR TODOS OS REMÉDIOS
// ======================================================

async function reagendarRemedios(){

    if(!possuiCapacitor()){

        return;

    }

    for(const remedio of remedios){

        await cancelarNotificacaoRemedio(

            remedio.id

        );

        await criarNotificacaoRemedio(

            remedio

        );

    }

}

// ======================================================
// SERVICE WORKER
// ======================================================

function registrarPWA(){

    if(!("serviceWorker" in navigator))
        return;

    navigator.serviceWorker
    .register("service-worker.js")
    .then(()=>{

        console.log("PWA registrado.");

    })
    .catch(erro=>{

        console.log(erro);

    });

}



// ======================================================
// INICIALIZAÇÃO
// ======================================================

function iniciarApp(){

    criarDia();

    if($("dataSelecionada")){

        $("dataSelecionada").value = dataAtual;

    }

    if($("metaAgua")){

        $("metaAgua").value = metaAgua;

    }

    verificarUsuario();

    carregarTema();

    mostrarDados();

    mostrarRemedios();

    reagendarRemedios();

    atualizarResumoRemedios();

    _restaurarLembreteAguaPWA();

    registrarPWA();

}



// ======================================================
// EVENTOS
// ======================================================

document.addEventListener(

    "DOMContentLoaded",

    iniciarApp

);
window.salvarNome = salvarNome;
window.alterarNome = alterarNome;
window.alternarTema = alternarTema;
window.abrirTela = abrirTela;
window.trocarDia = trocarDia;
window.adicionarAgua = adicionarAgua;
window.adicionarAguaPersonalizada = adicionarAguaPersonalizada;
window.zerarAgua = zerarAgua;
window.registrarRefeicao = registrarRefeicao;
window.limparRefeicoes = limparRefeicoes;
window.adicionarComida = adicionarComida;
window.lembreteAgua = lembreteAgua;
window.testarNotificacao = testarNotificacao;
window.cadastrarRemedio = cadastrarRemedio;

// ======================================================
// CADASTRAR REMÉDIO
// ======================================================

async function cadastrarRemedio(){

    const nome =
    $("nomeRemedio").value.trim();

    const dose =
    $("dosagemRemedio").value.trim();

    const hora =
    $("horaRemedio").value;

    const obs =
    $("obsRemedio").value.trim();


    if(nome===""){

        alert("Digite o nome do remédio.");

        return;

    }

    if(hora===""){

        alert("Escolha um horário.");

        return;

    }


    remedios.push({

        id: Math.floor(Math.random() * 1000000),

        nome:nome,

        dose:dose,

        hora:hora,

        obs:obs,

        tomado:false,

        ultimoDia:""

    });


   salvarRemedios();

await criarNotificacaoRemedio(

    remedios[remedios.length-1]

);

mostrarRemedios();

limparFormularioRemedio();
    alert("Remédio cadastrado!");

}
// ======================================================
// LIMPAR FORMULÁRIO
// ======================================================

function limparFormularioRemedio(){

    $("nomeRemedio").value="";

    $("dosagemRemedio").value="";

    $("horaRemedio").value="";

    $("obsRemedio").value="";

}
// ======================================================
// LISTAR REMÉDIOS
// ======================================================
// ======================================================
// MOSTRAR REMÉDIOS
// ======================================================

function mostrarRemedios(){

    const lista = $("listaRemedios");

    if(!lista) return;

    if(remedios.length===0){

        lista.innerHTML=`

<li style="justify-content:center;color:#888;">

Nenhum remédio cadastrado.

</li>

`;

        return;

    }

    let html="";

    remedios.forEach(remedio=>{

        const status =
        remedio.ultimoDia===dataAtual;

        html+=`

<li class="remedioItem ${status ? "remedioConcluido":""}">

<div class="remedioInfo">

<div class="remedioNome">

💊 ${remedio.nome}

</div>

<div class="remedioDose">

${remedio.dose || "Sem dosagem"}

</div>

<div class="remedioHora">

🕒 ${remedio.hora}

</div>

${

remedio.obs

?

`<small>${remedio.obs}</small>`

:

""

}

<div class="${
status
?
"statusTomado"
:
"statusPendente"
}">

${
status
?
"✔ Tomado hoje"
:
"⏰ Pendente"
}

</div>

</div>

<div class="remedioBotoes">

<button
class="btnTomado"
onclick="marcarTomado(${remedio.id})">

✔ Tomei

</button>

<button
class="btnEditar"
onclick="editarRemedio(${remedio.id})">

✏ Editar

</button>

<button
class="btnExcluirRemedio"
onclick="excluirRemedio(${remedio.id})">

🗑 Excluir

</button>

</div>

</li>

`;

    });

    lista.innerHTML=html;

}
// ======================================================
// MARCAR COMO TOMADO
// ======================================================

function marcarTomado(id){

    const remedio =
    remedios.find(r=>r.id===id);

    if(!remedio)
        return;

    remedio.ultimoDia = dataAtual;

    salvarRemedios();

    mostrarRemedios();

    atualizarResumoRemedios();

    alert(

        remedio.nome +

        " marcado como tomado."

    );

}
// ======================================================
// EXCLUIR REMÉDIO
// ======================================================

async function excluirRemedio(id){

    if(!confirm("Excluir este remédio?"))

        return;

    await cancelarNotificacaoRemedio(id);

    remedios =

    remedios.filter(

        r=>r.id!==id

    );

    salvarRemedios();

    mostrarRemedios();

    atualizarResumoRemedios();

}
// ======================================================
// EDITAR
// ======================================================

function editarRemedio(id){

    const remedio =
    remedios.find(r=>r.id===id);

    if(!remedio)
        return;

    $("nomeRemedio").value =
    remedio.nome;

    $("dosagemRemedio").value =
    remedio.dose;

    $("horaRemedio").value =
    remedio.hora;

    $("obsRemedio").value =
    remedio.obs;


    cancelarNotificacaoRemedio(id);

    excluirRemedio(id);


    abrirTela(

        "remedios",

        document.querySelectorAll(".menu button")[3]

    );

}
// ======================================================
// RESUMO DOS REMÉDIOS
// ======================================================

function atualizarResumoRemedios(){

    const lista =
    $("resumoRemedios");

    if(!lista)
        return;

    if(remedios.length===0){

        lista.innerHTML=

        "<li>Nenhum remédio cadastrado.</li>";

        return;

    }

    let html="";

    remedios.forEach(r=>{

        html+=`

<li>

<div>

💊 ${r.nome}

<br>

<small>

🕒 ${r.hora}

</small>

</div>

<div>

${
r.ultimoDia===dataAtual
?
"✔"
:
"⏰"
}

</div>

</li>

`;

    });

    lista.innerHTML=html;

}
// ======================================================
// CANCELAR NOTIFICAÇÃO
// ======================================================

async function cancelarNotificacaoRemedio(id){

    if(!possuiCapacitor()){

        return;

    }

    await Capacitor.Plugins.LocalNotifications.cancel({

        notifications:[

            {

                id:id

            }

        ]

    });

}
// ======================================================
// CANCELAR TODOS OS REMÉDIOS
// ======================================================

async function cancelarTodosRemedios(){

    if(!possuiCapacitor()){

        return;

    }

    const lista = remedios.map(r=>({

        id:r.id

    }));

    if(lista.length===0){

        return;

    }

    await Capacitor.Plugins.LocalNotifications.cancel({

        notifications:lista

    });

}