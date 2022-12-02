// method from assignment 2 in front end will also be computed here.


exports.handleMove = (gameShared, [x1, y1, x2, y2]) => {
    const history = gameShared["history"];
    const rows = gameShared["rows"];
    const cols = gameShared["cols"];
    const playerCount = gameShared["numPlayers"];
    const totalBoxes = (rows - 1) * (cols - 1);


    // all point coordinates must be integer
    if (![x1, y1, x2, y2].reduce((prevBool, num) => prevBool && Number.isInteger(num), true)) {
        return "failed: all point coordinates must be integers";
    }

    // points coordinates must be in range (0 <= x < rows, 0 <= y < cols)
    const isFailCheck1 = [x1, y1, x2, y2].reduce((prevBool, num) => prevBool || num < 0, false);
    const isFailCheck2 = x1 >= rows || x2 >= rows;
    const isFailCheck3 = y1 >= cols || y2 >= cols;
    if (isFailCheck1 || isFailCheck2 || isFailCheck3) {
        return "failed: out of range coordinate set";
    }

    // need to handle preventing some illegal moves
    // no diagonal lines are allowed,
    // only lines where either x1 == x2 and abs(y1-y2) == 1
    // only lines where either y1 == y2 and abs(x1-x2) == 1
    if (Math.abs(x2 - x1) + Math.abs(y2 - y1) !== 1) {
        return "failed: illegal move";
    }

    // follow same convention to avoid duplicates
    if (x1 < x2) {
        [x1, y1, x2, y2] = [x1, y1, x2, y2];
    }
    else if (x1 > x2) {
        [x1, y1, x2, y2] = [x2, y2, x1, y1];
    }
    else if (y1 <= y2) {
        [x1, y1, x2, y2] = [x1, y1, x2, y2];
    }
    else {
        [x1, y1, x2, y2] = [x2, y2, x1, y1];
    }


    const currentStatus = history[history.length - 1];
    const newClickedLines = { ...currentStatus.clickedLines };

    if ([x1, y1, x2, y2].includes(null)) {
        return "failed: invalid points";
    }
    const key = [x1, y1, x2, y2].join('-');
    // do not allow to click previously clicked lines
    if (key in newClickedLines) {
        return "failed: line already clicked";
    }

    newClickedLines[key] = currentStatus.turn;
    const newPlayesScore = { ...currentStatus.playersScore };
    let newCompletedBoxes = { ...currentStatus.completedBoxes };
    const foundCompletedBoxes = findNewCompletedBoxes([rows, cols], [x1, y1, x2, y2], newClickedLines);
    let newTurn;
    if (foundCompletedBoxes) {
        // console.log(foundCompletedBoxes);
        // console.log(newClickedLines);
        // score increases only if at last 1 box is completed
        newPlayesScore['player' + currentStatus.turn] += foundCompletedBoxes.length;
        foundCompletedBoxes.forEach((startPointRect) => {
            const keystartPointRect = startPointRect.join('-');
            if (keystartPointRect in newCompletedBoxes) {
                console.log("\tERROR: handleMove: keystartPointRect already present in newCompletedBoxes");
                // console.log(keystartPointRect);
                // console.log(newCompletedBoxes);
            }
            newCompletedBoxes[keystartPointRect] = currentStatus.turn;
        });
        // player turn remains same: same player must click a line again
        newTurn = currentStatus.turn;
    }
    else {
        // player turn changes only when a box is not completed
        newTurn = (currentStatus.turn + 1) % playerCount;
    }


    history.push({
        clickedLines: newClickedLines,
        completedBoxes: newCompletedBoxes,
        playersScore: newPlayesScore,
        turn: newTurn,
    })

    const gameCompletedFlag = Object.keys(newCompletedBoxes).length === totalBoxes;
    if (gameCompletedFlag) {
        console.log("\thandleMove: Game is completed");
    } else {
    }

    return "success";
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