import {library} from "@fortawesome/fontawesome-svg-core";
import {
    faAddressCard,
    faBolt,
    faChartBar,
    faClock,
    faCloudDownloadAlt,
    faComment,
    faDownload,
    faFileAlt,
    faGlobe,
    faPlus,
    faSignOutAlt,
    faSort,
    faSortDown,
    faSortUp,
    faSync,
    faThumbtack,
    faTimes,
    faTrash,
    faTv,
    faUpload,
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
        faDropbox, faTwitter, faUsers, faAddressCard, faSort, faDownload, faUpload, faTrash, faSync, faSortUp, faSortDown)
}
