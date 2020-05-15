import {setUpFontAwesome} from "./fontAwesome";
import {setUpI18n} from "./i18n";
import {loadAllConfig} from "./configLoader";

export function setUp() {
    setUpFontAwesome();
    return [setUpI18n(), loadAllConfig()]
}