import { LocalNotifications } from '@capacitor/local-notifications';


export async function testeNotificacao(){

    await LocalNotifications.requestPermissions();


    await LocalNotifications.schedule({

        notifications:[

            {
                title:"💧 Controle Saúde",

                body:"Teste de notificação funcionando!",

                id:1,

                schedule:{
                    at:new Date(Date.now()+10000)
                }

            }

        ]

    });

}