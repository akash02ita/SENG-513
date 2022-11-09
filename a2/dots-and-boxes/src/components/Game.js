
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
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
            // console.log("Should not infintely loop.");
            setDimensions({
                width: divRef.current.offsetWidth,
                height: divRef.current.offsetHeight
            });
        };

        window.addEventListener("resize", handleResize);
        // TODO: add more event listeners: mouse move and click: is this the right place?

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    /*
        The TA source of event listener and the following sources helped me figure out and ensure I am properly getting mouse coordinates during mouse movement and click.

        https://codingbeautydev.com/blog/react-get-mouse-position/
    */
    const [mouseCoord, setMouseCoord] = useState({ x: 0, y: 0 });
    const handleMouseMove = (event) => {
        setMouseCoord({
            /* 
                These do not work properly:
                    - issue1: event.target is not always the div from where onMouseMove, onClick attibutes are set. There are nested tags in it.
                    - issue2: ClientX and ClientY are not suitable and safe
                        - suppose you add another <Gamge /> component in App.js
                        - clientX/Y are relative to viewport but offsetLeft/Top are relative to page and not viewport!
            x: event.clientX - event.target.offsetLeft,
            y: event.clientY - event.target.offsetTop, */
            x: event.pageX - document.getElementById(props.boardId).offsetLeft,
            y: event.pageY - document.getElementById(props.boardId).offsetTop,
        });
        // console.log("MouseMove detected for boardId " + props.boardId);
        // console.log(mouseCoord);
        // console.log(event);
    }
    
    const handleMouseClick = (event) => {
        setMouseCoord({
            x: event.pageX - document.getElementById(props.boardId).offsetLeft,
            y: event.pageY - document.getElementById(props.boardId).offsetTop,
        });
        // console.log("MouseClick detected for boardId " + props.boardId);
        // console.log(mouseCoord);
        // console.log(event);

    }

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

    const OFFSET = 40;
    const renderCircles = () => {
        // ignore if width and height are not valid
        if (!currWidth || !currHeight) {
            return;
        }

        // circles should not be at corners but rather somewhere in middle (but not too much in middle)
        const customHeight = Math.max(currHeight * 0.8, currHeight - OFFSET);
        const customWidth = Math.max(currWidth * 0.8, currWidth - OFFSET);
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
        // console.log(circles);
        const svgCircles = circles.map(([x, y]) => {
            return (
                <circle key={x + '-' + y} cx={x} cy={y} r={5} />
            );
        });
        // console.log(svgCircles);
        return svgCircles;
    }

    const renderLines = (clickedLines) => {
        // TODO: somehow we should keep track of all lines
        // then use that array to output lines in the right fashion
        // <line x1={} y1={} x2={} y2={}/>

        // activeLines is a dictionary
        /*
                00-01 02 03
                10-11 12 13

                0001: true
                0010: nope
                0111: nope
                1011: true

                i,j,i,j+1
                i,j,i+1,j
                i,j+1,i+1,j+1
                i+1,j,i+1,j+1
        */
        let lines = [];
        // horizontal lines
        for (let j = 0; j < cols; j++) {
            for (let i = 0; i < rows - 1; i++) {

            }
        }
        // vertical lines

        const svgLines = null; // lines.map()

    }


    return (
        <div className="Game" style={{ backgroundColor: "yellow", width: "50%", padding: "5em", margin: "0.5em" }}>
            <p>This is an svg file</p>
            <p>window inner width {window.innerWidth}</p>
            <div id={props.boardId} className="svgDiv" ref={divRef} onMouseMove={handleMouseMove} onClick={handleMouseClick}>
                <svg height="100%" width="100%" style={{ backgroundColor: "cyan" }} >
                    {renderCircles()}
                    {renderLines()}
                </svg>
            </div>
            <p style={{ width: "50%" }}>In Game.js svgDiv width is {currWidth}</p>
            <p>Mouse coordinates are {mouseCoord.x} and {mouseCoord.y}</p>
        </div>
    );
}


export default Game;