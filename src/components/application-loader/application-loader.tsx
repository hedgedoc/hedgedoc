import React, {Fragment, useEffect, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import "./application-loader.scss";
import {Alert} from "react-bootstrap";

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

    return (<Fragment>{
        doneTasks < initTasks.length || initTasks.length === 0 ? (
            <div className="loader middle">
                <div className="icon">
                    <FontAwesomeIcon icon="file-alt" size="6x"
                                     className={failed ? "animation-shake" : "animation-pulse"}/>
                </div>
                {
                    failed ? <Alert variant={"danger"}>An error occured while loading the application!</Alert> : null
                }
            </div>
        ) : children
    }</Fragment>);
}
