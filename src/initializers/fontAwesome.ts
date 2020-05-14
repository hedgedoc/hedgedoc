import {library} from "@fortawesome/fontawesome-svg-core";
import {
    faBolt,
    faChartBar,
    faClock,
    faCloudDownloadAlt,
    faComment,
    faFileAlt,
    faGlobe,
    faPlus,
    faShare,
    faSignOutAlt,
    faThumbtack,
    faTimes,
    faTrash,
    faTv,
    faUsers,
} from "@fortawesome/free-solid-svg-icons";
import {
    faDiscourse,
    faDropbox,
    faFacebook,
    faGithub,
    faGitlab,
    faGoogle,
    faMastodon,
    faTwitter
} from "@fortawesome/free-brands-svg-icons";

export function setUpFontAwesome() {
    library.add(faBolt, faPlus, faChartBar, faTv, faFileAlt, faCloudDownloadAlt,
        faTrash, faSignOutAlt, faComment, faDiscourse, faMastodon, faGlobe,
        faThumbtack, faClock, faTimes, faGithub, faGitlab, faGoogle, faFacebook,
        faDropbox, faTwitter, faShare, faUsers)
}
