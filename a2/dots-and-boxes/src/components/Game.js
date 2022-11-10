
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
                                   \  T1     /
                                    \       /
                              T4      Mid     T2
                                    /      \   ->E(x,y)
                                   /  T3    \
                          D(x2,y1)           C(x2,y2)
        */
        // So the closest line to E is one of AB,BC,DC,AD
        // But how do we find the closest one? Well one property is to think about in which of the 4 triangles (T1,T2,T3,T4) the point E lies in
        // EDGE CASE: what if E == Mid?
        // we will just pick one choice, whichever the below code picks first.


        const getLineByTriangleContainingPoint = (E, A, B, C, D) => {
            const isPointinTriangle = (e, p0, p1, p2) => {
                // This boolean method is from the following source:
                // https://stackoverflow.com/questions/2049582/how-to-determine-if-a-point-is-in-a-2d-triangle
                const s = (p0[0] - p2[0]) * (e[1] - p2[1]) - (p0[1] - p2[1]) * (e[0] - p2[0]);
                const t = (p1[0] - p0[0]) * (e[1] - p0[1]) - (p1[1] - p0[1]) * (e[0] - p0[0]);

                if ((s < 0) != (t < 0) && s != 0 && t != 0)
                    return false;

                var d = (p2[0] - p1[0]) * (e[1] - p1[1]) - (p2[1] - p1[1]) * (e[0] - p1[0]);
                return d == 0 || (d < 0) == (s + t <= 0);
            }

            // get center of rectangle
            const M = [(A[0] + B[0]) / 2, (A[1] + D[1]) / 2];
            // if point E is one of the triangle then return the appriate line coordinates
            if (isPointinTriangle(E, A, M, B)) {
                return [A[0], A[1], B[0], B[1]];
            }
            else if (isPointinTriangle(E, B, M, C)) {
                return [B[0], B[1], C[0], C[1]];
            }
            else if (isPointinTriangle(E, D, M, C)) {
                return [D[0], D[1], C[0], C[1]];

            } else if (isPointinTriangle(E, A, M, D)) {
                return [A[0], A[1], D[0], D[1]];

            }

            // otherwise return null coordinates since point is outside the square, so inside none of the triangles
            return [null, null, null, null];
        }
        const E = [mouseCoord.x, mouseCoord.y];
        const A = [closestX1, closestY1];
        const B = [closestX2, closestY1];
        const C = [closestX2, closestY2];
        const D = [closestX1, closestY2];

        const [lineX1, lineY1, lineX2, lineY2] = getLineByTriangleContainingPoint(E, A, B, C, D);
        console.log("Debug getlinebymouse");
        console.log([lineX1, lineY1, lineX2, lineY2]);
        return [lineX1, lineY1, lineX2, lineY2];
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