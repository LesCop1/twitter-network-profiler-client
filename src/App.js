import React, { useState, useEffect } from 'react';
import { makeStyles } from '@mui/styles';
import { alpha } from '@mui/material/styles';
import {
    AppBar,
    Box,
    Button,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    InputAdornment,
    InputBase,
    Link,
    Slider,
    Switch,
    Toolbar,
    Tooltip,
    Typography,
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import { ForceGraph2D } from "react-force-graph";
import axios from "axios";

function getDialogContent(type) {
    switch (type) {
        case "about":
            return (
                <>$
                    <DialogTitle>About us!</DialogTitle>
                    <DialogContent>
                        We are two students, Mathis and Thomas, from the north of France, in the last year of a cybersecurity master's degree.<br />
                        <br />
                        You can find our GitHub profiles here:<br />
                        <Link href={"https://github.com/MathisEngels"}>Mathis Engels</Link><br />
                        <Link href={"https://github.com/radikaric"}>Thomas Bauduin</Link><br />
                        <br />
                        Thanks for looking us up :)
                    </DialogContent>
                </>
            );
        case "why":
            return (
                <>
                    <DialogTitle>Why did we make this?</DialogTitle>
                    <DialogContent>
                        As part of the first year of our master's degree, we had to make something about security for our semester project.<br />
                        We decided to create a profiling tool for Twitter.<br />
                        We chose to continue to work on this project for our second year by updating it, upgrading it, adding more functionalities, and much more!<br />
                        <br />
                        It makes us realize how volatile our data is, how easy it can be fetched (with neat tricks) and how we can exploit it.<br />
                        Also, making it visualize is kinda fun and you can learn a lot about yourself and/or your target(s).<br />
                    </DialogContent>
                </>
            );
        default:
            return <></>;
    }
};

function getSize(depth) {
    if (depth === 0) return 20;
    if (depth === 1) return 12;
    if (depth === 2) return 8;
    if (depth === 3) return 6;
}

const useStyles = makeStyles((theme) => ({
    home: {
        display: "flex",
        flexDirection: "column",
        height: "100vh",
    },
    grow: {
        flexGrow: 1,
    },
    title: {
        display: "none",
        [theme.breakpoints.up("sm")]: {
            display: "block",
        },
    },
    search: {
        position: "relative",
        borderRadius: theme.shape.borderRadius,
        backgroundColor: alpha(theme.palette.common.white, 0.15),
        "&:hover": {
            backgroundColor: alpha(theme.palette.common.white, 0.25),
        },
        marginRight: theme.spacing(2),
        marginLeft: 0,
        width: "100%",
        [theme.breakpoints.up("sm")]: {
            marginLeft: theme.spacing(3),
            width: "auto",
        },
    },
    searchIcon: {
        padding: theme.spacing(0, 2),
        height: "100%",
        position: "absolute",
        pointerEvents: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    inputRoot: {
        color: "inherit",
    },
    inputAdornment: {
        marginTop: "-4px",
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    },
    inputInput: {
        padding: theme.spacing(1, 1, 1, 0),
        marginLeft: "-6px !important",
        transition: theme.transitions.create("width"),
        width: "100%",
        [theme.breakpoints.up("md")]: {
            width: "20ch",
        },
    },
    slider: {
        marginRight: theme.spacing(2),
        marginLeft: theme.spacing(2),
        width: "100%",
        [theme.breakpoints.up("md")]: {
            width: "15ch",
        },
        textAlign: "center",
    },
    sliderRoot: {
        color: alpha(theme.palette.common.white, 0.45) + '!important',
        "&:hover": {
            color: alpha(theme.palette.common.white, 0.75) + '!important',
        },
    },
    sliderThumb: {
        color: theme.palette.common.white,
    },
    sliderTrack: {
        color: alpha(theme.palette.common.white, 0.95),
        background: alpha(theme.palette.common.white, 0.95),
    },
    sliderWarning: {
        color: theme.palette.warning.main,
    },
    switch: {
        display: "flex",
        alignItems: "center",
        marginRight: theme.spacing(2),
        marginLeft: theme.spacing(2),
        textAlign: "center"
    },
    switchBase: {
        "&.Mui-checked": {
            color: "#fff !important"
        },
        "&.Mui-checked + .MuiSwitch-track": {
            backgroundColor: "#00ff08 !important",
        }
    },
    button: {
        position: "relative",
        marginRight: theme.spacing(2),
        marginLeft: theme.spacing(2),
    },
    buttonRoot: {
        backgroundColor: "#2bbf2f !important",
        "&.Mui-disabled": {
            backgroundColor: "rgba(0, 0, 0, 0.26) !important"
        },
    },
    footer: {
        padding: theme.spacing(3, 2),
        marginTop: "auto",
        backgroundColor: "#1976d2",
        boxShadow: "0px -2px 4px -1px rgb(0 0 0 / 20%), 0px -4px 5px 0px rgb(0 0 0 / 14%), 0px -1px 10px 0px rgb(0 0 0 / 12%)",
        transition: "box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
        color: "#fff",
        "& * ": {
            color: "#fff !important",
        }
    },
    footerText: {
        textAlign: "center",
        "& > * + *": {
            marginLeft: theme.spacing(2),
            marginRight: theme.spacing(2),
        },
    },
    textAlignCenter: {
        textAlign: "center",
    },
}));

function App() {
    const classes = useStyles();

    const [target, setTarget] = useState("");
    const [tweetLimit, setTweetLimit] = useState(100);
    const [relationLimit, setRelationLimit] = useState(10);
    const [depth, setDepth] = useState(1);
    const [dialogData, setDialogData] = useState({ state: false, type: null });
    const [graphSize, setGraphSize] = useState({ height: 0, width: 0 });
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const [animationState, setAnimationState] = useState(true);
    const [instagramLookupState, seInstagramLookupState] = useState(true);
    const [loadingData, setLoadingData] = useState({ relations: 0, timeAvg: 0, timeStart: 0, error: "" });
    const [loadingTime, setLoadingTime] = useState(0);
    const [loadingState, setLoadingState] = useState(false);
    const [loadingInterval, setLoadingInterval] = useState(null);

    useEffect(() => {
        function updateSize() {
            // Minus header minus footer
            setGraphSize({
                height: window.innerHeight - 64 - 72,
                width: window.innerWidth,
            });
        }
        window.addEventListener("resize", updateSize);
        updateSize();
        return () => window.removeEventListener("resize", updateSize);
    }, []);

    const URL = 'http://localhost:8080';

    const requestData = async (_target, _tweetLimit, _relationLimit, _instagramLookupState, _depth) => {
        wipeData();
        setDialogData({ state: true, type: "loading" });
        setLoadingState(true);

        let response = null;
        try {
            response = await axios.get(URL + '/search', {
                params: {
                    target: _target,
                    tweetLimit: _tweetLimit,
                    relationLimit: _relationLimit,
                    instagramLookup: _instagramLookupState,
                    depth: _depth
                }
            });
        } catch (err) {
            console.log(err);
        }

        if (response) {
            // Création des nodes
            const nodes = [];

            const data = response.data.data;
            for (let i = 0; i < data.length; i++) {
                nodes.push({
                    id: data[i].userId,
                    val: getSize(data[i].depth),
                    ...data[i],
                    color: "blue"
                });
            }

            // Création des links
            const links = [];

            const tree = response.data.tree;

            const root = Object.keys(tree)[0];
            const rootTree = tree[root];

            changeColorById(nodes, root, "purple");
            for (let i = 0; i < rootTree.length; i++) {
                changeColorById(nodes, rootTree[i].key, getColor(rootTree[i].occurence));

                links.push({
                    source: root,
                    target: rootTree[i].key,
                    val: rootTree[i].occurence
                });

                const depth1Tree = rootTree[i].tab;
                for (let j = 0; j < depth1Tree.length; j++) {
                    links.push({
                        source: rootTree[i].key,
                        target: depth1Tree[j].key,
                        val: depth1Tree[j].occurence
                    });

                    const depth2Tree = depth1Tree[j].tab;
                    for (let k = 0; k < depth2Tree.length; k++) {
                        links.push({
                            source: depth1Tree[j].key,
                            target: depth2Tree[k].key,
                            val: depth2Tree[k].occurence
                        });
                    }
                }
            }

            setGraphData({ nodes, links });
            setLoadingState(false);
            setDialogData({ ...dialogData, state: false });
        }
    };
    const changeColorById = (array, id, color) => {
        for (let i = 0; i < array.length; i++) {
            if (array[i].id === id) {
                array[i].color = color;
                break;
            }
        }
    };
    const getColor = (occurence) => {
        if (0 <= occurence && occurence < 2) {
            return "red";
          } else if (2 <= occurence && occurence < 7) {
            return "orange";
          } else {
            return "green";
          }
    }
    const wipeData = () => {
        if (graphData && graphData.nodes.length > 0) {
            setGraphData({ nodes: [], links: [] });
        }
    };

    const handleTargetChange = (event) => {
        wipeData();
        setTarget(event.target.value);
    };
    const handleTargetKeyPress = async (event) => {
        if (event.keyCode === 13) {
            await requestData(event.target.value, tweetLimit, relationLimit, instagramLookupState, depth);
        }
    };
    const handleTweetLimitChange = (_, value) => {
        setTweetLimit(value);
        wipeData();
    };
    const handleRelationLimitChange = (_, value) => {
        setRelationLimit(value);
        wipeData();
    };
    const handleDepthChange = (_, value) => {
        setDepth(value);
        wipeData();
    };
    const handleAnimationStateChange = () => {
        setAnimationState(!animationState);
    };
    const handleInstagramLookupStateChange = () => {
        seInstagramLookupState(!instagramLookupState);
    };
    const onClickSearch = async () => {
        await requestData(target, tweetLimit, relationLimit, instagramLookupState, depth);
    };

    const onClickOpenDialog = (type) => {
        setDialogData({ state: true, type: type });
    };
    const handleDialogClose = () => {
        setDialogData({ ...dialogData, state: false });
    };
    const handleDialogLoadingClose = () => {
        handleDialogClose();
        // clearLoading();
      };

    return (
        <div className={classes.home}>
            <AppBar position={"static"}>
                <Toolbar>
                    <Typography className={classes.title} variant={"h6"} noWrap>
                        Twitter Network Profiler
                    </Typography>
                    <div className={classes.grow} />
                    <Tooltip
                        title={"Your target. The search will be based on this user."}
                        arrow
                    >
                        <div className={classes.search}>
                            <div className={classes.searchIcon}>
                                <SearchIcon />
                            </div>
                            <InputBase
                                placeholder={"John"}
                                startAdornment={
                                    <InputAdornment
                                        position={"start"}
                                        disableTypography
                                        classes={{ root: classes.inputAdornment }}
                                    >
                                        @
                                    </InputAdornment>
                                }
                                classes={{
                                    root: classes.inputRoot,
                                    input: classes.inputInput,
                                }}
                                inputProps={{ "aria-label": "search" }}
                                onChange={handleTargetChange}
                                onKeyDown={handleTargetKeyPress}
                                value={target}
                            />
                        </div>
                    </Tooltip>
                    <Tooltip title={`Sample size. It'll retrieve the last ${tweetLimit} tweets of targets.`}>
                        <div className={classes.slider}>
                            <Slider
                                classes={{
                                    root: classes.sliderRoot,
                                    thumb: classes.sliderThumb,
                                    track: classes.sliderTrack
                                }}
                                value={tweetLimit}
                                onChange={handleTweetLimitChange}
                                min={50}
                                max={2000}
                            />
                            <Typography>{tweetLimit} Tweets.</Typography>
                        </div>
                    </Tooltip>
                    <Tooltip
                        title={`The maximum number of relations per targets. Only the top ${relationLimit} relations will be shown. 
            Warning: Above 35 relations, you may experience lags.`}
                    >
                        <div className={classes.slider}>
                            <Slider
                                classes={{
                                    root: classes.sliderRoot,
                                    thumb:
                                        relationLimit < 35
                                            ? classes.sliderThumb
                                            : classes.sliderWarning,
                                    track: classes.sliderTrack
                                }}
                                value={relationLimit}
                                onChange={handleRelationLimitChange}
                                min={1}
                                max={50}
                            />
                            <Typography
                                className={
                                    relationLimit < 35
                                        ? classes.sliderThumb
                                        : classes.sliderWarning
                                }
                            >
                                {relationLimit} Relations.
                            </Typography>
                        </div>
                    </Tooltip>
                    <Tooltip
                        title={`Depth.`}
                    >
                        <div className={classes.slider}>
                            <Slider
                                classes={{
                                    root: classes.sliderRoot,
                                    thumb:
                                        depth < 3
                                            ? classes.sliderThumb
                                            : classes.sliderWarning,
                                    track: classes.sliderTrack
                                }}
                                value={depth}
                                onChange={handleDepthChange}
                                min={1}
                                max={3}
                            />
                            <Typography
                                className={
                                    depth < 2
                                        ? classes.sliderThumb
                                        : classes.sliderWarning
                                }
                            >
                                Depth {depth}.
                            </Typography>
                        </div>
                    </Tooltip>
                    <Tooltip title={"Enable animation."}>
                        <div className={classes.switch}>
                            <Switch
                                classes={{
                                    switchBase: classes.switchBase,
                                }}
                                checked={animationState}
                                onChange={handleAnimationStateChange}
                            />
                            <Typography variant={"body1"} noWrap>
                                Animation
                            </Typography>
                        </div>
                    </Tooltip>
                    <Tooltip title={"Enable Instagram lookup."}>
                        <div className={classes.switch}>
                            <Switch
                                classes={{
                                    switchBase: classes.switchBase,
                                }}
                                checked={instagramLookupState}
                                onChange={handleInstagramLookupStateChange}
                            />
                            <Typography variant={"body1"} noWrap>
                                Instagram
                            </Typography>
                        </div>
                    </Tooltip>
                    <Button
                        variant={"contained"}
                        className={classes.button}
                        classes={{
                            root: classes.buttonRoot
                        }}
                        onClick={onClickSearch}
                        disabled={target === ""}
                    >
                        Search
                    </Button>
                </Toolbar>
            </AppBar>
            <main>
                <ForceGraph2D
                    graphData={graphData}
                    height={graphSize.height}
                    width={graphSize.width}
                    linkDirectionalParticles={animationState ? 1 : 0}
                />
                {/* <NoSSRForceGraph
                    graphData={data}
                    height={graphSize.height}
                    width={graphSize.width}
                    nodeLabel={graphTooltip}
                    onNodeClick={onNodeClick}
                    linkDirectionalParticles={animationState ? 1 : 0}
                /> */}
            </main>
            <footer className={classes.footer}>
                <Container maxWidth="sm">
                    <Typography variant="body1" className={classes.footerText}>
                        <Link
                            onClick={() => onClickOpenDialog("about")}
                            href={"#"}>
                            About us
                        </Link>
                        <span>·</span>
                        <Link
                            onClick={() => onClickOpenDialog("why")}
                            href={"#"}>
                            Why did we make this
                        </Link>
                        <span>·</span>
                        <Link href={"/RAPPORT_TNP_ENGELS_BAUDUIN.pdf"}>Report</Link>
                    </Typography>
                </Container>
            </footer>
            <Dialog
                open={dialogData.state}
                onClose={
                    dialogData.type !== "loading"
                        ? handleDialogClose
                        : handleDialogLoadingClose
                }
                disableBackdropClick={
                    dialogData.type === "loading" && loadingData.error === ""
                }
                disableEscapeKeyDown={
                    dialogData.type === "loading" && loadingData.error === ""
                }
            >
                {dialogData.type !== "loading" ? (
                    <>
                        {getDialogContent(dialogData.type)}
                        <DialogActions>
                            <Button
                                onClick={handleDialogClose}
                                color="primary">
                                Close
                            </Button>
                        </DialogActions>
                    </>
                ) : (
                    <div className={classes.textAlignCenter}>
                        <DialogTitle>Searching @{target}...</DialogTitle>
                        <DialogContent>
                            {loadingData.error === "" ? (
                                <>
                                    <Box position="relative" display="inline-flex">
                                        {loadingData.timeStart !== 0 && loadingTime !== 0 ? (
                                            <CircularProgress
                                                variant={"determinate"}
                                                size={100}
                                            // value={Math.min(
                                            //     (getLoadingCounter(loadingTime, loadingData) * 100) /
                                            //     loadingData.relations,
                                            //     100
                                            // )}
                                            />
                                        ) : (
                                            <CircularProgress variant={"indeterminate"} size={100} />
                                        )}
                                        <Box
                                            top={0}
                                            left={0}
                                            bottom={0}
                                            right={0}
                                            position="absolute"
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                        >
                                            {/* <Typography component="div">
                                                {loadingData.timeStart !== 0 && loadingTime !== 0
                                                    ? `${Math.min(
                                                        getLoadingCounter(loadingTime, loadingData),
                                                        loadingData.relations
                                                    )} / ${loadingData.relations}`
                                                    : "0/1"}
                                            </Typography> */}
                                        </Box>
                                    </Box>
                                    <Typography variant={"h6"}>
                                        Estimated time left: - {" "}
                                        {/* {loadingData.timeStart !== 0 &&
                                            loadingTime !== 0 &&
                                            getLoadingCounter(loadingTime, loadingData) <
                                            loadingData.relations
                                            ? `~${(
                                                (loadingData.timeAvg * loadingData.relations -
                                                    getLoadingCounter(loadingTime, loadingData) *
                                                    loadingData.timeAvg) /
                                                1000
                                            ).toFixed(1)}s`
                                            : "In few seconds"} */}
                                    </Typography>
                                    <br />
                                </>
                            ) : (
                                <>
                                    <Typography variant={"body1"}>An error occurred:</Typography>
                                    <Typography variant={"h6"}>{loadingData.error}</Typography>
                                </>
                            )}
                            <Typography variant={"caption"}>
                                Target: {target} · Tweet limit: {tweetLimit} · Relation limit:{" "}
                                {relationLimit} · Depth: {depth}
                            </Typography>
                            {loadingData.timeStart !== 0 &&
                                loadingTime !== 0 &&
                                loadingData.error === "" && (
                                    <>
                                        <br />
                                        <Typography variant={"caption"}>
                                            Relations: {loadingData.relations} · Avg time/rel:{" "}
                                            {loadingData.timeAvg}ms
                                        </Typography>
                                    </>
                                )}
                        </DialogContent>
                        {loadingData.error !== "" && (
                            <DialogActions>
                                <Button
                                    onClick={handleDialogLoadingClose}
                                    color="primary">
                                    Close
                                </Button>
                            </DialogActions>
                        )}
                    </div>
                )}
            </Dialog>
        </div>
    );
}

export default App;
