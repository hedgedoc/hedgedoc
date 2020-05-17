import React, {Fragment} from "react";

export interface ElementSeparatorProps {
    separator: React.ReactElement
}

export const ElementSeparator: React.FC<ElementSeparatorProps> = ({children, separator}) => {
    return (
        <Fragment>
            {
                React.Children.map(children, (child, index) => {
                    return <Fragment>
                        {
                            (index > 0) ? separator : null
                        }
                        {child}
                    </Fragment>
                })
            }
        </Fragment>
    )
}