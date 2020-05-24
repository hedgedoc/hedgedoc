import React, {Fragment, useEffect, useState} from "react";
import "./application-loader.scss";
import {LoadingScreen} from "./loading-screen";

interface ApplicationLoaderProps {
    initTasks: Promise<any>[]
}

export const ApplicationLoader: React.FC<ApplicationLoaderProps> = ({children, initTasks}) => {
    const [failed, setFailed] = useState<boolean>(false);
    const [doneTasks, setDoneTasks] = useState<number>(0);

    useEffect(() => {
        setDoneTasks(0);
        initTasks.forEach(task => {
            (async () => {
                try {
                    await task;
                    setDoneTasks(prevDoneTasks => {
                        return prevDoneTasks + 1;
                    })
                } catch (reason) {
                    setFailed(true);
                    console.error(reason);
                }
            })();
        })
    }, [initTasks]);

    return (
        doneTasks < initTasks.length || initTasks.length === 0 ?
            <LoadingScreen failed={failed}/> :
            <Fragment>{children}</Fragment>
    );
}