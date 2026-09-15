import { MessageAction } from "../_enum/MessageActionEnum";



chrome.storage.local.get(["isOn"], (result) => {
    if (result.isOn) {


        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === MessageAction.SEND_PAGE_CONTENT) {

                sendResponse({
                    content: document.body.innerText,
                    url: window.location.href,
                });
            }

            // Note: If you need to fetch data asynchronously before calling sendResponse, 
            // you MUST return true here to keep the message channel open.
            // return true; 
        });


    }
});