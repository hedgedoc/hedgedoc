import React from "react";
import {useTranslation} from "react-i18next";
import moment from "moment";

const LanguagePicker: React.FC = () => {
    const {i18n} = useTranslation();

    const onChangeLang = (event:  React.ChangeEvent<HTMLSelectElement>) => {
        moment.locale(event.currentTarget.value);
        i18n.changeLanguage(event.currentTarget.value);
    }

    return (
        <select className="mb-2" value={i18n.language} onChange={onChangeLang}>
            <option value="en">English</option>
            <option value="zh-CN">简体中文</option>
            <option value="zh-TW">繁體中文</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
            <option value="ja">日本語</option>
            <option value="es">Español</option>
            <option value="ca">Català</option>
            <option value="el">Ελληνικά</option>
            <option value="pt">Português</option>
            <option value="it">Italiano</option>
            <option value="tr">Türkçe</option>
            <option value="ru">Русский</option>
            <option value="nl">Nederlands</option>
            <option value="hr">Hrvatski</option>
            <option value="pl">Polski</option>
            <option value="uk">Українська</option>
            <option value="hi">हिन्दी</option>
            <option value="sv">Svenska</option>
            <option value="eo">Esperanto</option>
            <option value="da">Dansk</option>
            <option value="ko">한국어</option>
            <option value="id">Bahasa Indonesia</option>
            <option value="sr">Cрпски</option>
            <option value="vi">Tiếng Việt</option>
            <option value="ar">العربية</option>
            <option value="cs">Česky</option>
            <option value="sk">Slovensky</option>
        </select>
    )
}

export { LanguagePicker }
