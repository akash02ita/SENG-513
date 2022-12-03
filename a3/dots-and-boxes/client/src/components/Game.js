
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PROXY from '../Global'

function Game(props) {
    const navigate = useNavigate();

    const { gamePasscode } = useParams();
    const [gameData, setGameData] = useState(null);
    const [rows, setrows] = useState(null);
    const [cols, setcols] = useState(null);
    const [playerCount, setplayerCount] = useState(null);
    const [totalLines, settotalLines] = useState(null);
    const [totalBoxes, settotalBoxes] = useState(null);

    const playerColors = props.colors ? props.colors : ["red", "green", "blue", "yellow", "orange", "pink", "purple"];


    useEffect(() => {
        let json_response = null;
        fetch(PROXY+'/game/' + gamePasscode, {credentials: 'include'})
            .then(response => response.json())
            .then(data => { console.log("App:handleJoinGame: data is ", data); json_response = data; })
            .then(
                () => {
                    if (!json_response) {
                        alert("No response received");
                        return;
                    }
                    const status = json_response["status"];
                    if (status !== 'success') {
                        alert(json_response["description"]);
                        return;
                    }

                    setGameData(json_response["shared"]);

                    // get size of board (dots*dots) otherwise by default 4x4 dots
                    setrows(json_response["shared"]["rows"]); // number of dots horizontally
                    setcols(json_response["shared"]["cols"]); // number of dots vertically

                    settotalLines((rows) * (cols - 1) + (cols) * (rows - 1));
                    settotalBoxes((rows - 1) * (cols - 1));

                    // get playerCount otherwise by default 3
                    setplayerCount(json_response["shared"]["numPlayers"]);
                }
            );

        // keep polling till componenet is not unmounted
        const idinterval = setInterval(handlePoll, 500);
        // clearinterval will run once component unmounts
        return () => clearInterval(idinterval);

    }, []);




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

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);


    // this method allows to find which line is closest (the line to be dashed or to be clicked)
    const [dashedLineCoord, setDashedLineCoord] = useState({ x1: null, y1: null, x2: null, y2: null });

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
            x: event.pageX - document.getElementById("defaultBoardId1").offsetLeft,
            y: event.pageY - document.getElementById("defaultBoardId1").offsetTop,
        });
        const [lineX1, lineY1, lineX2, lineY2] = getClosestLineCoordByMouse([rows, cols], dimensions, mouseCoord);
        setDashedLineCoord({ x1: lineX1, y1: lineY1, x2: lineX2, y2: lineY2 });
        // console.log("MouseMove detected for boardId " + "defaultBoardId1");
        // console.log(mouseCoord);
        // console.log(event);
    }


    const handlePoll = () => {
        let json_response = null;
        fetch(PROXY+'/pollGame/' + gamePasscode, {credentials: 'include'})
            .then(response => response.json())
            .then(data => { console.log("App:handlepoll: data is ", data); json_response = data; })
            // .then(data => json_response = data)
            .then(
                () => {
                    if (!json_response) {
                        alert("No response received");
                        return;
                    }
                    const status = json_response["status"];
                    if (status !== 'success') {
                        alert(json_response["description"]);
                        return;
                    }
                    // check win status
                    const newHistory = json_response["shared"]["history"];
                    const newtotalBoxes = (json_response["shared"]["rows"] - 1) * (json_response["shared"]["cols"] - 1);
                    const gameCompletedFlag = Object.keys(newHistory[newHistory.length - 1]["completedBoxes"]).length === newtotalBoxes;
                    // console.log("handlepoll debug a b", Object.keys(newHistory[newHistory.length - 1]["completedBoxes"]).length, newtotalBoxes);
                    if (gameCompletedFlag) {
                        console.log("handlepoll: Game is completed");

                        // .. is used to go back to parent route
                        navigate("../stats/" + gamePasscode);
                    }

                    setGameData(json_response["shared"]);
                    setHistory(json_response["shared"]["history"]);
                }
            )
    }
    const handleMouseClick = (event) => {
        setMouseCoord({
            x: event.pageX - document.getElementById("defaultBoardId1").offsetLeft,
            y: event.pageY - document.getElementById("defaultBoardId1").offsetTop,
        });
        // console.log("MouseClick detected for boardId " + "defaultBoardId1");
        // console.log(mouseCoord);
        // console.log(event);

        /* 
        UPDATE:
        - turn: which is a numberic number \in [mod playerCount]
        - lines to draw
        - make a list of colors
        - draw line with color = colors[turn]
        - score
        - history
        */
        // get clone of dictionary
        const currentStatus = history[history.length - 1];
        const newClickedLines = { ...currentStatus.clickedLines };

        const [x1, y1, x2, y2] = getClosestLinePointsByMouse([rows, cols], dimensions, mouseCoord);
        if ([x1, y1, x2, y2].includes(null)) {
            return;
        }
        const key = [x1, y1, x2, y2].join('-');
        // do not allow to click previously clicked lines
        if (key in newClickedLines) {
            return;
        }

        // apply the move
        let json_response = null;
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                "points": [x1, y1, x2, y2],
            })
        };
        fetch(PROXY+'/applyMove/' + gamePasscode, requestOptions)
            .then(response => response.json())
            .then(data => { console.log("Game:handleMouseClick: data is ", data); json_response = data; })
            .then(
                () => {
                    if (!json_response) {
                        alert("No response received");
                        return;
                    }
                    const status = json_response["status"];
                    if (status !== 'success') {
                        alert(json_response["description"]);
                        return;
                    }
                }
            );


        const newCompletedBoxes = currentStatus.completedBoxes;
        const gameCompletedFlag = Object.keys(newCompletedBoxes).length === totalBoxes;
        console.log("handleMouseClick: a,b", Object.keys(newCompletedBoxes).length, totalBoxes);
        if (gameCompletedFlag && false) {
            console.log("handleMouseClick: Game is completed");
            // .. is used to go back to parent route
            navigate("../stats/" + gamePasscode)
        }

    }

    // HISTORY to keep track of all moves. Also allows to go back in history or restart game
    const firstTurn = props.firstTurn ? props.firstTurn : 0;
    const [history, setHistory] = useState([{
        clickedLines: {},
        completedBoxes: {},
        playersScore: generatePlayersZeroScore(playerCount),
        turn: firstTurn,
    }]);
    // console.log("Debug history");
    // console.log(history);

    // strictly based on dimensions of svg, we want to draw lines
    // this will ensure that lines are ALWAYS proportional to size of svg (div parent) container.
    // this will make design responsive on change of window size
    const [currWidth, currHeight] = [dimensions.width, dimensions.height];

    const renderCircles = () => {
        // ignore if width and height are not valid
        if (!currWidth || !currHeight) {
            return;
        }

        // circles should not be at corners but rather somewhere in middle (but not too much in middle)


        const [idealWidth, idealHeight, offsetX, offsetY] = getIdealDrawingArea(dimensions);
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

    const renderLines = () => {
        let lines = [];
        const linesPoints = history[history.length - 1].clickedLines;
        Object.entries(linesPoints).forEach(([key, turnValue]) => {
            const [px1, py1, px2, py2] = key.split('-').map((strnum) => parseInt(strnum));
            const [lineX1, lineY1, lineX2, lineY2] = getLineCoordBetweenPoints([px1, py1, px2, py2], [rows, cols], dimensions);
            lines.push([lineX1, lineY1, lineX2, lineY2, turnValue]);

        });

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

    const renderCompletedBoxes = () => {
        const currentStatus = history[history.length - 1];
        const completedBoxesRectangles = [];

        const [idealWidth, idealHeight, offsetX, offsetY] = getIdealDrawingArea(dimensions);
        const rectWidth = dPR(idealWidth / (cols - 1));
        const rectHeight = dPR(idealHeight / (rows - 1));

        Object.entries(currentStatus.completedBoxes).forEach(([key, turnValue]) => {
            const [startPX, startPY] = key.split('-').map((strnum) => parseInt(strnum));
            const rectOffsetX = dPR(startPX / (cols - 1) * idealWidth + offsetX);
            const rectOffsetY = dPR(startPY / (rows - 1) * idealHeight + offsetY);
            completedBoxesRectangles.push([rectOffsetX, rectOffsetY, turnValue]);
        });

        const svgCompletedBoxesRectangles = completedBoxesRectangles.map(([rectOffsetX, rectOffsetY, turnValue]) => {
            return (<rect key={[rectOffsetX, rectOffsetY].join('-')} x={rectOffsetX} y={rectOffsetY} width={rectWidth} height={rectHeight} style={{ fill: playerColors[turnValue] }} />);
        });
        return svgCompletedBoxesRectangles;

    }

    const renderPlayersSCore = () => {
        const currentStatus = history[history.length - 1];
        const playersScore = currentStatus.playersScore;
        const divPlayersScore = Object.entries(playersScore).map(([playerName, playersScore]) => {
            const userIndex = parseInt(playerName.split('player')[1]);
            const username = gameData["users"][userIndex];
            const playerClr = playerColors[userIndex];
            return (
                // playername is always unique
                <div key={playerName} className="player-score" style={{ color: playerClr }}>
                    {username} : {playersScore}
                </div>
            );
        });
        return (<div className="players-score-list">
            Here the score of all the players:
            {divPlayersScore}
        </div>);
    }


    if (!gameData || !gameData["isLobbyFull"]) {
        return (
            <div className="Game">
                <div className="current-turn">
                    Waiting for players to join at {gamePasscode}
                    <br />
                    <br />
                </div>
                <div id={"defaultBoardId1"} className="svgDiv" ref={divRef} onMouseMove={handleMouseMove} onClick={handleMouseClick}>
                    <svg>
                        {/* rendering order matters (circles/dots should be in front) */}
                        {renderLines()}
                        {renderCircles()}
                    </svg>
                </div>
            </div>
        );
    }
    return (
        <div className="Game">
            <div className="current-turn">
                {/* Current turn: player{history[history.length - 1].turn} */}
                Current turn: {gameData["users"][history[history.length - 1].turn]}
                <br />
                <br />
            </div>
            <div id={"defaultBoardId1"} className="svgDiv" ref={divRef} onMouseMove={handleMouseMove} onClick={handleMouseClick}>
                <svg>
                    {/* rendering order matters (circles/dots should be in front) */}
                    {/* renderCompletedBoxes RECTANGLES WITH SEMI-TRANSPARENT COLOR: do transparancy in sCSS */}
                    {renderCompletedBoxes()}
                    {renderDashedLine()}
                    {renderLines()}
                    {renderCircles()}
                </svg>
            </div>
            {/* <div className="button-flex">
                <button onClick={() => props.handleGoToLanding()}>HOME</button>
                <button onClick={handleUndoStep}>Undo step</button>
                <button onClick={handleRestartGame}>RESTART</button>
            </div> */}
            <br />
            {renderPlayersSCore()}
        </div>
    );
}


export default Game;

const generatePlayersZeroScore = (playerCount) => {
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

// getIdealDrawingArea: svg element should fit in an area slightly shrinked, away from corners. This is to prevent elementnts, such as dots/circles to be partially not visible at corners.
const [SCALE_TRANSLATION, SCALE_FACTOR] = [40, 0.80];
const getIdealDrawingArea = (dimensions) => {
    const currWidth = dimensions.width;
    const currHeight = dimensions.height;
    const idealHeight = dPR(Math.max(currHeight * SCALE_FACTOR, currHeight - SCALE_TRANSLATION));
    const idealWidth = dPR(Math.max(currWidth * SCALE_FACTOR, currWidth - SCALE_TRANSLATION));
    // Offsets will be rounded to some precision level
    // Otherwise they cause floating precission accuracies problem in javascript, which will later cause to get improper (Math.floor will round to a value lower by 1) calculations in converting coordinates to points and vice versa
    const offsetX = dPR((currWidth - idealWidth) / 2);
    const offsetY = dPR((currHeight - idealHeight) / 2);

    return [idealWidth, idealHeight, offsetX, offsetY];
}

const getClosestLineCoordByMouse = ([rows, cols], dimensions, mouseCoord) => {
    // console.log("BEGIN getClosestLineCoordByMouse");
    // invalid mouse coordinates output null coord entries
    if (mouseCoord.x < 0 || mouseCoord.x > dimensions.width) {
        // console.log("ERR getClosestLineCoordByMouse: Invalid x coordinates");
        return [null, null, null, null];
    }
    if (mouseCoord.y < 0 || mouseCoord.y > dimensions.height) {
        // console.log("ERR getClosestLineCoordByMouse: Invalid y coordinates");
        return [null, null, null, null];
    }

    // Do calculations in Local Space
    const [idealWidth, idealHeight, offsetX, offsetY] = getIdealDrawingArea(dimensions);
    // console.log("getClosestLineCoordByMouse: [idealWidth, idealHeight, offsetX, offsetY]");
    // console.log([idealWidth, idealHeight, offsetX, offsetY]);
    const [x, y] = [Math.max(0, mouseCoord.x - offsetX), Math.max(0, mouseCoord.y - offsetY)];
    // console.log("getClosestLineCoordByMouse: [x, y] -offset for local space");
    // console.log([x, y]);
    let closestX1 = Math.min(
        idealWidth / (cols - 1) * (cols - 2), // 2nd last (last is not allowed: that will be closestX2)
        Math.floor(x / idealWidth * (cols - 1)) / (cols - 1) * idealWidth);
    let closestY1 = Math.min(
        idealHeight / (rows - 1) * (rows - 2), // 2nd last (last is not allowed: that will be closestY2)
        Math.floor(y / idealHeight * (rows - 1)) / (rows - 1) * idealHeight);
    let closestX2 = closestX1 + idealWidth / (cols - 1);
    let closestY2 = closestY1 + idealHeight / (rows - 1);

    // console.log("getClosestLineCoordByMouse: before global space: [closestX1,Y1,X2,y2");
    // console.log([closestX1, closestY1, closestX2, closestY2]);

    // go back to Global Space
    closestX1 += offsetX;
    closestY1 += offsetY;
    closestX2 += offsetX;
    closestY2 += offsetY;

    // console.log("getClosestLineCoordByMouse: after global space: [closestX1,Y1,X2,y2");
    // console.log([closestX1, closestY1, closestX2, closestY2]);
    // Now we have 2 x and 2 y coordinates whose cartesian product will yield to the 4 points
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

            if ((s < 0) !== (t < 0) && s !== 0 && t !== 0)
                return false;

            var d = (p2[0] - p1[0]) * (e[1] - p1[1]) - (p2[1] - p1[1]) * (e[0] - p1[0]);
            return d === 0 || (d < 0) === (s + t <= 0);
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

    const [lineX1, lineY1, lineX2, lineY2] = getLineByTriangleContainingPoint(E, A, B, C, D).map(dPR);
    // console.log("getClosestLineCoordByMouse: FINAL OUTPUT: [lineX1, lineY1, lineX2, lineY2]");
    // console.log([lineX1, lineY1, lineX2, lineY2]);
    return [lineX1, lineY1, lineX2, lineY2];
}

const getClosestLinePointsByMouse = ([rows, cols], dimensions, mouseCoord) => {
    // console.log("BEGIN getClosestLinePointsByMouse");
    let [lineX1, lineY1, lineX2, lineY2] = getClosestLineCoordByMouse([rows, cols], dimensions, mouseCoord);
    // console.log([lineX1, lineY1, lineX2, lineY2]);
    // console.log("back to getClosestLinePointsByMouse");
    // convert line coordinates to point coordinates
    if (![lineX1, lineY1, lineX2, lineY2].includes(null)) {
        // console.log("getClosestLinePointsByMouse: successful entering of if");
        // do calculations in local space
        const [idealWidth, idealHeight, offsetX, offsetY] = getIdealDrawingArea(dimensions);

        // console.log("getClosestLinePointsByMouse: [idealWidth, idealHeight, offsetX, offsetY]");
        // console.log([idealWidth, idealHeight, offsetX, offsetY]);

        lineX1 = Math.max(0, dPR(lineX1 - offsetX));
        lineY1 = Math.max(0, dPR(lineY1 - offsetY));
        lineX2 = Math.max(0, dPR(lineX2 - offsetX));
        lineY2 = Math.max(0, dPR(lineY2 - offsetY));
        // console.log("getClosestLinePointsByMouse: offset to local space: [lineX1, lineY1, lineX2, lineY2]");
        // console.log([lineX1, lineY1, lineX2, lineY2]);

        // BUG FIX: here the same issue arises when rows=cols=6. dPR fixes the bug.
        const x1 = Math.floor(dPR(lineX1 / idealWidth * (cols - 1)));
        const y1 = Math.floor(dPR(lineY1 / idealHeight * (rows - 1)));
        const x2 = Math.floor(dPR(lineX2 / idealWidth * (cols - 1)));
        const y2 = Math.floor(dPR(lineY2 / idealHeight * (rows - 1)));
        // console.log("getClosestLinePointsByMouse: FINAL OUPTUT: [x1, y1, x2, y2]");
        // console.log([x1, y1, x2, y2]);
        return [x1, y1, x2, y2];
    }

    // return null if invalid mouse coordinates (or outside all boxes)
    // console.log("FAILED getClosestLinePointsByMouse: output null");
    return [null, null, null, null];

}

const getLineCoordBetweenPoints = ([x1, y1, x2, y2], [rows, cols], dimensions) => {
    // console.log("BEGIN getLineCoordBetweenPoints");
    // console.log("INPUT: [x1, y1, x2, y2]");
    // console.log([x1, y1, x2, y2]);
    // ensure x \in [mod rows] and y \in [mod cols]
    if (x1 < 0 || y1 < 0 || x2 < 0 || y2 < 0) {
        // console.log("getLineCoordBetweenPoints: INVALID < 0");
        return [null, null, null, null];
    }
    if (x1 > cols - 1 || y1 > rows - 1 || x2 > cols - 1 || y2 > rows - 1) {
        // console.log("getLineCoordBetweenPoints: INVALID > limitsize");
        return [null, null, null, null];
    }

    // Coordinates must be calculated in local space than offset to global
    const [idealWidth, idealHeight, offsetX, offsetY] = getIdealDrawingArea(dimensions);
    // console.log("getLineCoordBetweenPoints: [idealWidth, idealHeight, offsetX, offsetY]");
    // console.log("[idealWidth, idealHeight, offsetX, offsetY]");
    let lineX1 = x1 / (cols - 1) * idealWidth + offsetX;
    let lineY1 = y1 / (rows - 1) * idealHeight + offsetY;
    let lineX2 = x2 / (cols - 1) * idealWidth + offsetX;
    let lineY2 = y2 / (rows - 1) * idealHeight + offsetY;
    [lineX1, lineY1, lineX2, lineY2] = [lineX1, lineY1, lineX2, lineY2].map(dPR);
    // console.log("getLineCoordBetweenPoints: FINAL STAGE");
    // console.log("INPUT:  [x1, y1, x2, y2]");
    // console.log([x1, y1, x2, y2]);
    // console.log("OUTPUT: [lineX1, lineY1, lineX2, lineY2]");
    // console.log([lineX1, lineY1, lineX2, lineY2]);
    // return line coordnates, in Global Space
    return [lineX1, lineY1, lineX2, lineY2];
}

const findNewCompletedBoxes = ([rows, cols], [px1, py1, px2, py2], clickedLines) => {
    // console.log("BEGIN findNewCompletedBox");
    // console.log("findNewCompletedBox: input [px1, py1, px2, py2]");
    // console.log([px1, py1, px2, py2]);
    // console.log("findNewCompletedBox: input clickedLines");
    // console.log(clickedLines);
    // const [px1, py1, px2, py2] = clickedLineKey.split('-').map((strnum) => parseInt(strnum));
    if (py1 === py2) { // if there is/are completed box(es) is/are either above AND/OR below to the clickedLine
        // console.log("findNewCompletedBox: py1==py2");
        /*   
                            x1,y-1 _ _ _ _ _ _ _x2,y-1
                            |     ABOVE BOX      |
                            |                    |
                            x1,y-----------------x2,y
                            |     BELOW BOX      |
                            |                    |
                            x1,y+1 _ _ _ _ _ _ _x2,y+1
        */
        const py = py1;
        const aboveBoxLinesPoints = [
            [px1, py - 1, px2, py - 1],
            [px2, py - 1, px2, py],
            [px1, py, px2, py],
            [px1, py - 1, px1, py],
        ];
        const belowBoxLinesPoints = [
            [px1, py, px2, py],
            [px2, py, px2, py + 1],
            [px1, py + 1, px2, py + 1],
            [px1, py, px1, py + 1],
        ];
        // console.log("findNewCompletedBox: aboveBoxLinesPoints");
        // console.log(aboveBoxLinesPoints);
        // console.log("findNewCompletedBox: belowBoxLinesPoints");
        // console.log(belowBoxLinesPoints);
        const isAboveBoxCompleted = aboveBoxLinesPoints.reduce((prevBool, points) => prevBool && (points.join('-') in clickedLines), true);
        const isBelowBoxCompleted = belowBoxLinesPoints.reduce((prevBool, points) => prevBool && (points.join('-') in clickedLines), true);

        // if any of the boxes is completed, return in format list([startPointX, startPointY]) to help create offsets when drawing later rectangles in renderCompletedBoxes
        if (isAboveBoxCompleted && isBelowBoxCompleted) {
            // console.log("findNewCompletedBox: return above and below");
            return [[px1, py - 1], [px1, py]];
        }
        if (isAboveBoxCompleted) {
            // console.log("findNewCompletedBox: return above");
            return [[px1, py - 1]];
        }
        if (isBelowBoxCompleted) {
            // console.log("findNewCompletedBox: return below");
            return [[px1, py]];
        }
    }
    else if (px1 === px2) { // if there is/are completed box(es) is/are is either left AND/OR right to the clickedLine
        // console.log("findNewCompletedBox: px1 == px2");
        /*   
                            x-1,y1 _ _ _ _ _ _ _ x,y1 _ _ _ _ _ _ x+1,y1
                            |       LEFT BOX      .  RIGHT BOX      |
                            |                     .                 |
                            x-1,y2 _ _ _ _ _ _ _ x,y2 _ _ _ _ _ _ x+1,y2
        */
        const px = px1;
        const leftBoxLinesPoints = [
            [px - 1, py1, px, py1],
            [px, py1, px, py2],
            [px - 1, py2, px, py2],
            [px - 1, py1, px - 1, py2],
        ];
        const rightBoxLinesPoints = [
            [px, py1, px + 1, py1],
            [px + 1, py1, px + 1, py2],
            [px, py2, px + 1, py2],
            [px, py1, px, py2],
        ];
        // console.log("findNewCompletedBox: leftBoxLinesPoints");
        // console.log(leftBoxLinesPoints);
        // console.log("findNewCompletedBox: rightBoxLinesPoints");
        // console.log(rightBoxLinesPoints);
        const isLeftBoxCompleted = leftBoxLinesPoints.reduce((prevBool, points) => prevBool && (points.join('-') in clickedLines), true);
        const isRightBoxCompleted = rightBoxLinesPoints.reduce((prevBool, points) => prevBool && (points.join('-') in clickedLines), true);

        if (isLeftBoxCompleted && isRightBoxCompleted) {
            // console.log("findNewCompletedBox: return left and right");
            return [[px - 1, py1], [px, py1]];
        }
        if (isLeftBoxCompleted) {
            // console.log("findNewCompletedBox: return left");
            return [[px - 1, py1]];
        }
        if (isRightBoxCompleted) {
            // console.log("findNewCompletedBox: return left");
            return [[px, py1]];
        }
    }
    else {
        console.log("ERROR: findNewCompletedBox: both x/y points are different! Not a horizontal or vertical line!");
    }
    // console.log("findNewCompletedBox: null");
    return null;
}
