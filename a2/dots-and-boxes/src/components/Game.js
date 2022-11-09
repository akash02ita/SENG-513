
import { useLayoutEffect, useRef, useState } from 'react';
// TODO: rename this to Board.js

function Game(props) {

    /*
        The following 2 sources helped me figure how to retrieve dimensions without 'infinite' loop issues.
        // https://bobbyhadz.com/blog/react-get-width-of-element
        // https://www.pluralsight.com/guides/re-render-react-component-on-window-resize
    */
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const divRef = useRef();
    useLayoutEffect(() => {
        setDimensions({
            width: divRef.current.offsetWidth,
            height: divRef.current.offsetHeight
        });

        const handleResize = () => {
            console.log("Should not infintely loop.");
            setDimensions({
                width: divRef.current.offsetWidth,
                height: divRef.current.offsetHeight
            });
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    // strictly based on dimensions of svg, we want to draw lines
    // this will ensure that lines are ALWAYS proportional to size of svg (div parent) container.
    // this will make design responsive on change of window size
    const currWidth = dimensions.width;
    const currHeight = dimensions.height;

    // get size of board
    let rows = props.rows;
    let cols = props.cols;
    if (!rows || !cols) {
        rows = 4;
        cols = 4;
    }

    const renderCircles = () => {
        // ignore if width and height are not valid
        if (!currWidth || !currHeight) {
            return;
        }

        // circles should not be at corners but rather somewhere in middle
        const customHeight = currHeight * 0.8;
        const customWidth = currWidth * 0.8;
        const customOffsetX = (currWidth - customWidth) / 2;
        const customOffsetY = (currHeight - customHeight) / 2;
        let circles = [];
        for (let j = 0; j < cols; j++) {
            let y = customHeight / (cols - 1) * j + customOffsetY;
            for (let i = 0; i < rows; i++) {
                let x = customWidth / (rows - 1) * i + customOffsetX;
                circles.push([x, y]);
            }
        }
        console.log(circles);
        const svgCircles = circles.map(([x, y]) => {
            return (
                <circle key={x + '-' + y} cx={x} cy={y} r={5}></circle>
            );
        });
        console.log(svgCircles);
        return svgCircles;
    }

    const renderLines = () => {
        // TODO: somehow we should keep track of all lines
        // then use that array to output lines in the right fashion

    }


    return (
        <div className="Game" style={{ backgroundColor: "yellow", width: "50%", padding: "5em", margin: "0.5em" }}>
            <p>This is an svg file</p>
            <p>window inner width {window.innerWidth}</p>
            <div className="svgDiv" ref={divRef}>
                <svg height="100%" width="100%" style={{ backgroundColor: "cyan" }}>
                    {/* <line x1={0 * currWidth} y1={0 * currHeight} x2={0.80 * currWidth} y2={0.0 * currHeight} style={{ stroke: 'blue', strokeWidth: '5', }} />
                    <line x1={0 * currWidth} y1={0.50 * currHeight} x2={0.80 * currWidth} y2={0.50 * currHeight} style={{ stroke: 'red', strokeWidth: '5', }} />
                    <line y1={0 * currHeight} x1={0.10 * currWidth} y2={0.80 * currWidth} x2={0.10 * currHeight} style={{ stroke: 'black', strokeWidth: '5', }} /> */}
                    {renderCircles()}

                </svg>
            </div>
            <p style={{ width: "50%" }}>In Game.js svgDiv width is {currWidth}</p>
        </div>
    );
}


export default Game;