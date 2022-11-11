
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
// TODO: rename this to Board.js

function Game(props) {

    // get size of board (dots*dots) otherwise by default 4x4 dots
    const rows = props.rows && props.cols && props.rows > 1 && props.cols > 1 && props.rows < 10 && props.cols < 10 ? props.rows : 4; // number of dots horizontally
    const cols = props.rows && props.cols && props.rows > 1 && props.cols > 1 && props.rows < 10 && props.cols < 10 ? props.cols : 4; // number of dots vertically
    const playerColors = ["red", "green", "blue", "yellow", "orange", "pink", "purple"];
    const totalLines = (rows - 1) * (cols - 1);
    const maxPlayerCount = Math.min(totalLines, playerColors.length);

    // get playerCount otherwise by default 3
    const playerCount = props.playerCount && props.playerCount > 1 ? Math.min(maxPlayerCount, props.playerCount) : 3;

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
            // remove dashed line on resize
            setDashedLineCoord({ x1: null, y1: null, x2: null, y2: null, });
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
        console.log("BEGIN getClosestLineCoordByMouse");
        // invalid mouse coordinates output null coord entries
        if (mouseCoord.x < 0 || mouseCoord.x > dimensions.width) {
            console.log("ERR getClosestLineCoordByMouse: Invalid x coordinates");
            return [null, null, null, null];
        }
        if (mouseCoord.y < 0 || mouseCoord.y > dimensions.height) {
            console.log("ERR getClosestLineCoordByMouse: Invalid y coordinates");
            return [null, null, null, null];
        }

        // Do calculations in Local Space
        const [idealWidth, idealHeight, offsetX, offsetY] = idealFittingSize();
        console.log("getClosestLineCoordByMouse: [idealWidth, idealHeight, offsetX, offsetY]");
        console.log([idealWidth, idealHeight, offsetX, offsetY]);
        const [x, y] = [Math.max(0, mouseCoord.x - offsetX), Math.max(0, mouseCoord.y - offsetY)];
        console.log("getClosestLineCoordByMouse: [x, y] -offset for local space");
        console.log([x, y]);
        let closestX1 = Math.min(
            idealWidth / (cols - 1) * (cols - 2),
            Math.floor(x / idealWidth * (cols - 1)) / (cols - 1) * idealWidth);
        let closestY1 = Math.min(
            idealHeight / (rows - 1) * (rows - 2),
            Math.floor(y / idealHeight * (rows - 1)) / (rows - 1) * idealHeight);
        let closestX2 = closestX1 + idealWidth / (cols - 1);
        let closestY2 = closestY1 + idealHeight / (rows - 1);

        console.log("getClosestLineCoordByMouse: before global space: [closestX1,Y1,X2,y2");
        console.log([closestX1, closestY1, closestX2, closestY2]);

        // go back to Global Space
        closestX1 += offsetX;
        closestY1 += offsetY;
        closestX2 += offsetX;
        closestY2 += offsetY;

        console.log("getClosestLineCoordByMouse: after global space: [closestX1,Y1,X2,y2");
        console.log([closestX1, closestY1, closestX2, closestY2]);
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

        const [lineX1, lineY1, lineX2, lineY2] = getLineByTriangleContainingPoint(E, A, B, C, D).map((num) => dPR(num * 10) / 10);
        console.log("getClosestLineCoordByMouse: FINAL OUTPUT: [lineX1, lineY1, lineX2, lineY2]");
        console.log([lineX1, lineY1, lineX2, lineY2]);
        return [lineX1, lineY1, lineX2, lineY2];
    }

    const getClosestLinePointsByMouse = () => {
        console.log("BEGIN getClosestLinePointsByMouse");
        let [lineX1, lineY1, lineX2, lineY2] = getClosestLineCoordByMouse();
        console.log("back to getClosestLinePointsByMouse");
        // convert line coordinates to point coordinates
        if (lineX1 && lineY1 && lineX2 && lineY2) {
            console.log("getClosestLinePointsByMouse: successful entering of if");
            // PROBLEM: java precision floating is messing up at edge cases. example: Math.floor(0.9999/1.0) = 0 instead of 1
            // [lineX1, lineY1, lineX2, lineY2] = [lineX1, lineY1, lineX2, lineY2].map((num) => dPR(num);
            // TODO: do calculations in local space first
            const [idealWidth, idealHeight, offsetX, offsetY] = idealFittingSize();

            console.log("getClosestLinePointsByMouse: [idealWidth, idealHeight, offsetX, offsetY]");
            console.log([idealWidth, idealHeight, offsetX, offsetY]);

            lineX1 = Math.max(0, dPR(lineX1 - offsetX));
            lineY1 = Math.max(0, dPR(lineY1 - offsetY));
            lineX2 = Math.max(0, dPR(lineX2 - offsetX));
            lineY2 = Math.max(0, dPR(lineY2 - offsetY));
            console.log("getClosestLinePointsByMouse: offset to local space: [lineX1, lineY1, lineX2, lineY2]");
            console.log([lineX1, lineY1, lineX2, lineY2]);

            const x1 = Math.floor(lineX1 / idealWidth * (cols - 1));
            const y1 = Math.floor(lineY1 / idealHeight * (rows - 1));
            const x2 = Math.floor(lineX2 / idealWidth * (cols - 1));
            const y2 = Math.floor(lineY2 / idealHeight * (rows - 1));
            console.log("getClosestLinePointsByMouse: FINAL OUPTUT: [x1, y1, x2, y2]");
            console.log([x1, y1, x2, y2]);
            return [x1, y1, x2, y2];
        }

        // return null if invalid mouse coordinates (or outside all boxes)
        console.log("FAILED getClosestLinePointsByMouse: output null");
        return [null, null, null, null];

    }
    const getLineCoordBetweenPoints = ([x1, y1, x2, y2]) => {
        console.log("BEGIN getLineCoordBetweenPoints");
        console.log("INPUT: [x1, y1, x2, y2]");
        console.log([x1, y1, x2, y2]);
        // ensure x \in [mod rows] and y \in [mod cols]
        if (x1 < 0 || y1 < 0 || x2 < 0 || y2 < 0) {
            console.log("getLineCoordBetweenPoints: INVALID < 0");
            return [null, null, null, null];
        }
        if (x1 > cols - 1 || y1 > rows - 1 || x2 > cols - 1 || y2 > rows - 1) {
            console.log("getLineCoordBetweenPoints: INVALID > limitsize");
            return [null, null, null, null];
        }

        // Coordinates must be calculated in local space than offset to global
        const [idealWidth, idealHeight, offsetX, offsetY] = idealFittingSize();
        console.log("getLineCoordBetweenPoints: [idealWidth, idealHeight, offsetX, offsetY]");
        console.log("[idealWidth, idealHeight, offsetX, offsetY]");
        let lineX1 = x1 / (cols - 1) * idealWidth + offsetX;
        let lineY1 = y1 / (rows - 1) * idealHeight + offsetY;
        let lineX2 = x2 / (cols - 1) * idealWidth + offsetX;
        let lineY2 = y2 / (rows - 1) * idealHeight + offsetY;

        console.log("getLineCoordBetweenPoints: FINAL STAGE");
        console.log("INPUT:  [x1, y1, x2, y2]");
        console.log([x1, y1, x2, y2]);
        console.log("OUTPUT: [lineX1, lineY1, lineX2, lineY2]");
        console.log([lineX1, lineY1, lineX2, lineY2]);
        // return line coordnates, in Global Space
        return [lineX1, lineY1, lineX2, lineY2];
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
        console.log("check1");
        setMouseCoord({
            x: event.pageX - document.getElementById(props.boardId).offsetLeft,
            y: event.pageY - document.getElementById(props.boardId).offsetTop,
        });
        // console.log("MouseClick detected for boardId " + props.boardId);
        // console.log(mouseCoord);
        // console.log(event);

        /* 
        TODO: UPDATE:
        - turn: which is a numberic number \in [mod playerCount]
        - lines to draw
        - make a list of colors
        - draw line with color = colors[turn]
        - score
        - history
        */
        console.log("check2");
        // get clone of dictionary
        const currentStatus = history[history.length - 1];
        const newClickedLines = { ...currentStatus.clickedLines };

        const [x1, y1, x2, y2] = getClosestLinePointsByMouse();
        if ([x1, y1, x2, y2].includes(null)) {
            return;
        }
        const key = [x1, y1, x2, y2].join('-');
        // do not allow to click previously clicked lines
        if (key in newClickedLines) {
            return;
        }

        newClickedLines[key] = currentStatus.turn;
        const newPlayesScore = { ...currentStatus.playersScore };

        // TODO: score increases only if a box is completed
        newPlayesScore[currentStatus.turn] += 1;
        const newTurn = (currentStatus.turn + 1) % playerCount;

        setHistory(history.concat({
            clickedLines: newClickedLines,
            playersScore: newPlayesScore,
            turn: newTurn,
        }))
    }

    // HISTORY to keep track of all moves. Also allows to go back in history or restart game
    const firstTurn = props.firstTurn ? props.firstTurn : 0;
    const [history, setHistory] = useState([{
        clickedLines: {},
        playersScore: generatePlayersZeroScore(playerCount),
        turn: firstTurn,
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
        // Offsets will be rounded to some precision level
        // Otherwise they cause floating precission accuracies problem in javascript, which will later cause to get improper (Math.floor will round to a value lower by 1) calculations in converting coordinates to points and vice versa
        const offsetX = dPR((currWidth - idealWidth) / 2);
        const offsetY = dPR((currHeight - idealHeight) / 2);

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
        let lines = [];
        const linesPoints = history[history.length - 1].clickedLines;
        Object.entries(linesPoints).forEach(([key, turnValue]) => {
            const [px1, py1, px2, py2] = key.split('-').map((strnum) => parseInt(strnum));
            const [lineX1, lineY1, lineX2, lineY2] = getLineCoordBetweenPoints([px1, py1, px2, py2]);
            lines.push([lineX1, lineY1, lineX2, lineY2, turnValue]);

        })

        const svgLines = lines.map(([lineX1, lineY1, lineX2, lineY2, turnValue]) => {
            return (
                <line key={[lineX1, lineY1, lineX2, lineY2].join('-')} x1={lineX1} y1={lineY1} x2={lineX2} y2={lineY2} stroke={playerColors[turnValue]} />
            );
        });

        // console.log("Debug renderlines svglines");
        // console.log(svgLines);
        return svgLines;
    }

    const renderDashedLine = () => {
        const [x1, y1, x2, y2] = [dashedLineCoord.x1, dashedLineCoord.y1, dashedLineCoord.x2, dashedLineCoord.y2];

        if (![x1, y1, x2, y2].includes(null)) {
            // console.log("Dashed line is being rendered");
            return (<line key="dashed-line" x1={x1} x2={x2} y1={y1} y2={y2} strokeDasharray="4" stroke="grey" />);
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
                    {/* rendering order matters (circles/dots should be in front) */}
                    {renderDashedLine()}
                    {renderLines()}
                    {renderCircles()}
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

// (d)efault (P)recision (R)ounding method: this is to prevent floating pointing point inaccuracies and follow same precision level
const dPR = (num) => {
    // Math.ceil is a safer choice
    // suppose 0.3333...3 is the MINIMUM THRESHOLD to reaching something
    // 0.4 is more safer than 0.3, as 0.4 exceed MINIMUM THRESHOLD but 0.3 is below it.
    return Math.ceil(num * 10) / 10;
}