
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
// TODO: rename this to Board.js

function Game(props) {

    // get size of board (dots*dots) otherwise by default 4x4 dots
    const rows = props.rows && props.cols ? props.rows : 4;
    const cols = props.rows && props.cols ? props.cols : 4;

    // get playerCount otherwise by default 3
    const playerCount = props.playerCount && props.playerCount > 1 ? props.playerCount : 3;

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


    // this method allows to find which line is closest (the line to be dashed or to be clicked)
    const [dashedLineCoord, setDashedLineCoord] = useState({ x1: null, y1: null, x2: null, y2: null });
    const getClosestLineCoordByMouse = () => {
        // invalid mouse coordinates output null coord entries
        if (mouseCoord.x < 0 || mouseCoord.x > dimensions.width) {
            return [null, null, null, null];
        }
        if (mouseCoord.y < 0 || mouseCoord.y > dimensions.height) {
            return [null, null, null, null];
        }

        // Do calculations in Local Space
        const [idealWidth, idealHeight, offsetX, offsetY] = idealFittingSize();
        const [x, y] = [Math.max(0, mouseCoord.x - offsetX), Math.max(0, mouseCoord.y - offsetY)];
        let closestX1 = Math.min(
            idealWidth / (cols - 1) * (cols - 2),
            Math.floor(x / idealWidth * (cols - 1)) / (cols - 1) * idealWidth);
        let closestY1 = Math.min(
            idealHeight / (rows - 1) * (rows - 2),
            Math.floor(y / idealHeight * (rows - 1)) / (rows - 1) * idealHeight);
        let closestX2 = closestX1 + idealWidth / (cols - 1);
        let closestY2 = closestY1 + idealHeight / (rows - 1);

        // go back to Global Space
        closestX1 += offsetX;
        closestY1 += offsetY;
        closestX2 += offsetX;
        closestY2 += offsetY;

        // Now we have 2 x and 2 y coordinates whose cartesia product will yield to the 4 points
        // Those 4 points EXACTLY represent the box in which the line is present
        // The task is now to see where and which line is closest within that box according to mouse coordinates
        /* 
                          A(x1,y1)           B(x2,y1)
                                 \          /
                                  \        /
                                    E(x,y)
                                  /        \
                          D(x2,y1)           C(x2,y2)
        */
        // So the closest line to E is one of AB,BC,DC,AD
        // But how do we find the closest one? Well one property is to think about Traingles AEB, BEC, DEC, AED
        // The triangle with smallest perimeter is the one we can choose.
        // So the triangle that has the smallest SUM of 2 lines, containing the point E, is where the closest line is located
        // So, by finding min of EA+EB,EB+EC,EC+ED,ED+EA we can figure out where the smallest line will be
        // EDGE CASE: what if all sum of lengths are same (so that means E is exactly in center)?
        // we will just pick one choice, whichever the below code picks first.
        // for a more detailed explanation please see the code below

        const getSumDistSqr = ([x, y], [ax, ay], [bx, by]) => {
            const axy2 = Math.pow(ax - x, 2) + Math.pow(ay - y, 2);
            const bxy2 = Math.pow(bx - x, 2) + Math.pow(by - y, 2);
            // console.log("Debug dist")
            // console.log(x, y, ax, ay, bx, by);
            console.log(axy2 + " + " + bxy2 + " = " + (axy2 + bxy2));
            return axy2 + bxy2;
        }
        const E = [mouseCoord.x, mouseCoord.y];
        const A = [closestX1, closestY1];
        const B = [closestX2, closestY1];
        const C = [closestX2, closestY2];
        const D = [closestX1, closestY2];

        // sort in ascending order, based on 1st element of each sublist, the list of squared sum lengths of 2 sides of each triangle
        const distPointsList = [
            [getSumDistSqr(E, A, B), A, B],
            [getSumDistSqr(E, B, C), B, C],
            [getSumDistSqr(E, D, C), D, C],
            [getSumDistSqr(E, A, D), A, D],
        ].sort((a, b) => a[0] - b[0]);

        // console.log("The sorted list is");
        // console.log(distPointsList);

        // pick the list with smallest distance square of 2 sides of triangle
        const sd = distPointsList[0];
        [closestX1, closestY1, closestX2, closestY2] = [sd[1][0], sd[1][1], sd[2][0], sd[2][1]];


        console.log("Debug getlinebymouse");
        console.log([closestX1, closestY1, closestX2, closestY2]);
        return [closestX1, closestY1, closestX2, closestY2];
    }

    const getClosestLinePointsByMouse = () => {

    }
    const getLineCoordBetweenPoints = () => {

    }


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
        const [lineX1, lineY1, lineX2, lineY2] = getClosestLineCoordByMouse();
        setDashedLineCoord({ x1: lineX1, y1: lineY1, x2: lineX2, y2: lineY2 });
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

    // HISTORY to keep track of all moves. Also allows to go back in history or restart game
    const [history, setHistory] = useState([{
        clickedLines: {},
        playersScore: generatePlayersZeroScore(playerCount),
    }]);
    // console.log("Debug history");
    // console.log(history);

    // strictly based on dimensions of svg, we want to draw lines
    // this will ensure that lines are ALWAYS proportional to size of svg (div parent) container.
    // this will make design responsive on change of window size
    const [currWidth, currHeight] = [dimensions.width, dimensions.height];


    const [SCALE_TRANSLATION, SCALE_FACTOR] = [40, 0.80]
    const idealFittingSize = () => {
        const idealHeight = Math.max(currHeight * SCALE_FACTOR, currHeight - SCALE_TRANSLATION);
        const idealWidth = Math.max(currWidth * SCALE_FACTOR, currWidth - SCALE_TRANSLATION);
        const offsetX = (currWidth - idealWidth) / 2;
        const offsetY = (currHeight - idealHeight) / 2;

        return [idealWidth, idealHeight, offsetX, offsetY];
    }

    const renderCircles = () => {
        // ignore if width and height are not valid
        if (!currWidth || !currHeight) {
            return;
        }

        // circles should not be at corners but rather somewhere in middle (but not too much in middle)


        const [idealWidth, idealHeight, offsetX, offsetY] = idealFittingSize();
        let circles = [];
        for (let j = 0; j < rows; j++) {
            let y = idealHeight / (rows - 1) * j + offsetY;
            for (let i = 0; i < cols; i++) {
                let x = idealWidth / (cols - 1) * i + offsetX;
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
        for (let j = 0; j < rows; j++) {
            for (let i = 0; i < cols - 1; i++) {

            }
        }
        // vertical lines

        const svgLines = null; // lines.map()

    }

    const renderDashedLine = () => {
        const [x1, y1, x2, y2] = [dashedLineCoord.x1, dashedLineCoord.y1, dashedLineCoord.x2, dashedLineCoord.y2];

        if (x1 && y1 && x2 && y2) {
            console.log("Dashed line is being rendered");
            return (<line key="dashed-line" x1={x1} x2={x2} y1={y1} y2={y2} strokeDasharray="4" stroke="red" />);
        }
        // console.log("Dashed line NOT rendered");
        // console.log(dashedLineCoord);
        // console.log([x1, y1, x2, y2]);
    }


    return (
        <div className="Game" style={{ backgroundColor: "yellow", width: "50%", padding: "5em", margin: "0.5em" }}>
            <p>This is an svg file</p>
            <p>window inner width {window.innerWidth}</p>
            <div id={props.boardId} className="svgDiv" ref={divRef} onMouseMove={handleMouseMove} onClick={handleMouseClick}>
                <svg height="100%" width="100%" style={{ backgroundColor: "cyan" }} >
                    {renderCircles()}
                    {renderDashedLine()}
                    {renderLines()}
                </svg>
            </div>
            <p style={{ width: "50%" }}>In Game.js svgDiv width is {currWidth}</p>
            <p>Mouse coordinates are {mouseCoord.x} and {mouseCoord.y}</p>
        </div>
    );
}


export default Game;

function generatePlayersZeroScore(playerCount) {
    let playersZeroScore = {};
    for (let i = 0; i < playerCount; i++) {
        playersZeroScore['player' + i] = 0;
    }
    return playersZeroScore;
}