import {setUpFontAwesome} from "./fontAwesome";
import {setUpI18n} from "./i18n";
import {loadAllConfig} from "./configLoader";

function customDelay() {
    if (!!window.localStorage.getItem("customDelay")) {
        return new Promise((resolve => setTimeout(resolve, 5000)));
    } else {
        return Promise.resolve()
    }
}

export function setUp() {
    setUpFontAwesome();
    return [setUpI18n(), loadAllConfig(), customDelay()]
}