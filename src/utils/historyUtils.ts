import {HistoryEntry} from "../components/landing/pages/history/history";
import moment from "moment";

export function sortAndFilterEntries(entries: HistoryEntry[]): HistoryEntry[] {
    return sortEntries(entries);
}

function sortEntries(entries: HistoryEntry[]): HistoryEntry[] {
    return entries.sort((a, b) => {
        if (a.pinned && !b.pinned) {
            return -1;
        }
        if (!a.pinned && b.pinned) {
            return 1;
        }
        if (a.lastVisited < b.lastVisited) {
            return -1;
        }
        if (a.lastVisited > b.lastVisited) {
            return 1;
        }
        return 0;
    })
}

export function formatHistoryDate(date: Date) {
    return moment(date).format("llll")
}

export interface OldHistoryEntry {
    id: string;
    text: string;
    time: number;
    tags: string[];
    pinned: boolean;
}

export function loadHistoryFromLocalStore(): HistoryEntry[] {
    const historyJsonString = window.localStorage.getItem("history");
    if (historyJsonString === null) {
        // if localStorage["history"] is empty we check the old localStorage["notehistory"]
        // and convert it to the new format
        const oldHistoryJsonString = window.localStorage.getItem("notehistory")
        const oldHistory = !!oldHistoryJsonString ? JSON.parse(JSON.parse(oldHistoryJsonString)) : [];
        return oldHistory.map((entry: OldHistoryEntry) => {
            return {
                id: entry.id,
                title: entry.text,
                lastVisited: moment(entry.time).toDate(),
                tags: entry.tags,
                pinned: entry.pinned,
            }
        })
    } else {
        return JSON.parse(historyJsonString)
    }
}