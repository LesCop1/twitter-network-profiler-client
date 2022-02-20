import React, { useState, useEffect } from 'react';
import ReactDOMServer from 'react-dom/server';
import { makeStyles } from '@mui/styles';
import { alpha } from '@mui/material/styles';
import {
    Paper,
    Accordion,
    AccordionDetails,
    AccordionSummary,
    AppBar,
    Avatar,
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
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import { ForceGraph2D } from "react-force-graph";
import colorGradient from "javascript-color-gradient";
import moment from 'moment';
import axios from "axios";
import config from './config';

function abbrNum(number) {
    const decPlaces = Math.pow(10, 2);
    const abbrev = ["k", "m", "M", "t"];

    for (let i = abbrev.length - 1; i >= 0; i--) {
        const size = Math.pow(10, (i + 1) * 3);

        if (size <= number) {
            number = Math.round(number * decPlaces / size) / decPlaces;

            if ((number === 1000) && (i < abbrev.length - 1)) {
                number = 1;
                i++;
            }
            number += abbrev[i];

            break;
        }
    }
    return number;
}

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
}

function getSize(depth) {
    if (depth === 0) return 20;
    if (depth === 1) return 4;
    if (depth === 2) return 2;
    if (depth === 3) return 0.5;
}
const gradient = colorGradient.setGradient("#FF4136", "2ECC40").setMidpoint(5);
function getColor(proximity) {
    return gradient.getColor(proximity);
}
function changeColorById(array, id, color) {
    for (let i = 0; i < array.length; i++) {
        if (array[i].id === id) {
            array[i].color = color;
            break;
        }
    }
}

function getLoadingCounter(lastTime, data) {
    return Math.floor((lastTime - data.timeStart) / data.timeAvg);
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
        color: "white !important",
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
        color: "white !important",
    },
    inputAdornment: {
        color: "white !important",
        marginTop: "-4px",
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    },
    inputInput: {
        color: "white !important",
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
    mainContainer: {
        position: "relative"
    },
    informationPanel: {
        position: "absolute",
        right: 0,
        bottom: 0,
        padding: theme.spacing(1) + ' !important',
        width: 350 + 'px !important'
    },
    informationPanelDetails: {
        maxHeight: 350,
        overflow: "auto"
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
    tooltipPaper: {
        display: 'inline-block'
    },
    tooltipContainer: {
        padding: theme.spacing(1) + ' !important',
        width: 350 + 'px !important'
    },
    tooltipHeader: {
        display: 'flex',
        "& *": {
            marginLeft: theme.spacing(1),
            marginRight: theme.spacing(1),
        }
    },
    tooltipAvatar: {
        width: 56 + "px !important",
        height: 56 + "px !important",
    },
    tooltipName: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center"
    },
    tooltipBody: {
        margin: theme.spacing(1, 2, 0)
    },
    tooltipSocialsDescription: {
        overflow: "hidden",
        display: "-webkit-box",
        WebkitLineClamp: 2,
        "-webkit-box-orient": "vertical"
    },
    tooltipSocialsInfo: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline"
    },
    tooltipAccountInfo: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexWrap: "wrap",
        "& *": {
            margin: theme.spacing(0, 1) + " !important"
        }
    },
    tooltipInstagramPosts: {
        display: "flex",
        alignItems: "center",
        overflow: "auto",
    },
    tooltipInstagramPost: {
        maxWidth: "50%",
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
    const [loadingData, setLoadingData] = useState({ relations: 0, timeAvg: 1500, timeStart: 0, error: "" });
    const [loadingTime, setLoadingTime] = useState(0);
    const [loadingState, setLoadingState] = useState(false);
    const [loadingInterval, setLoadingInterval] = useState(null);
    const [selectedNode, setSelectedNode] = useState(null);

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

    useEffect(() => {
        if (!loadingState) {
            clearLoading();
        }
    }, [loadingState]);
    useEffect(() => {
        if (loadingState && loadingData.relations > 0) {
            startTickLoading();
        }
    }, [loadingData.relations]);
    const startTickLoading = () => {
        const interval = setInterval(() => {
            tickLoading();
        }, 1000);

        setLoadingInterval(interval);
    }
    const tickLoading = () => {
        if (getLoadingCounter(loadingTime, loadingData) > loadingData.relations) {
            clearInterval(loadingInterval);
            setLoadingInterval(null);
        } else if (loadingState) {
            setLoadingTime(Date.now());
        }
    };
    const clearLoading = () => {
        clearLoadingInterval();
        setLoadingData({
          relations: 0,
          timeAvg: 0,
          timeStart: 0,
          error: "",
        });
        setLoadingTime(0);
    };
    const clearLoadingInterval = () => {
        clearInterval(loadingInterval);
        setLoadingInterval(null);
    };

    const requestData = async (_target, _tweetLimit, _relationLimit, _instagramLookupState, _depth) => {
        setSelectedNode(null);
        wipeData();
        setDialogData({ state: true, type: "loading" });
        setLoadingState(true);
        const numRelations = Math.pow(relationLimit, depth) + 1;
        let timeAvg = _instagramLookupState ? 2250 + 500 : 2250;
        timeAvg = timeAvg * 0.9;
        setLoadingData({
            relations: numRelations,
            timeStart: Date.now(),
            timeAvg: timeAvg,
            error: ""
        });

        let response = null;
        try {
            response = await axios.get(config.BACKEND_URL + '/search', {
                params: {
                    target: _target,
                    tweetLimit: _tweetLimit,
                    relationLimit: _relationLimit,
                    instagramLookup: _instagramLookupState,
                    depth: _depth
                }
            });
        } catch (err) {
            setLoadingData({
                relations: 0,
                timeAvg: 0,
                timeStart: 0,
                error: err.response.data.error || err.response.error.toString(),
              });
        }

        if (response && response.data.success) {
            // Création des nodes
            const nodes = [];

            const data = response.data.data;
            for (let i = 0; i < data.length; i++) {
                nodes.push({
                    id: data[i].userId,
                    val: getSize(data[i].depth),
                    ...data[i],
                    color: "#B10DC9"
                });
            }

            // Création des links
            const links = [];

            const tree = response.data.tree;

            const root = Object.keys(tree)[0];
            const rootTree = tree[root];

            let highestOccurence = 0;
            for (let i = 0; i < rootTree.length; i++) {
                if (rootTree[i].occurence > highestOccurence) highestOccurence = rootTree[i].occurence;
            }

            changeColorById(nodes, root, "#0074D9");
            for (let i = 0; i < rootTree.length; i++) {
                changeColorById(nodes, rootTree[i].key, getColor(rootTree[i].occurence * 5 / highestOccurence));

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
    }
    const wipeData = () => {
        if (graphData && graphData.nodes.length > 0) {
            setGraphData({ nodes: [], links: [] });
        }
    }
    const graphTooltip = (node) => {
        const tooltip = (node) => {
            return <>
                <Paper elevation={12} className={classes.tooltipPaper}>
                    <Container fixed className={classes.tooltipContainer}>
                        {
                            node.available ? <>
                                <div className={classes.tooltipHeader}>
                                    <Avatar
                                        className={classes.tooltipAvatar}
                                        src={node.profilePictureUrl}
                                    />
                                    <div className={classes.tooltipName}>
                                        <Typography>{node.name}</Typography>
                                        <Typography variant={"caption"}>@{node.screenName}</Typography>
                                    </div>
                                </div>
                                <div className={classes.tooltipBody}>
                                    <Typography className={classes.tooltipSocialsDescription}>{node.description}</Typography>
                                    <div className={classes.tooltipSocialsInfo}>
                                        <Typography variant={"caption"}>{abbrNum(node.tweetCount)} Tweets</Typography>
                                        <span>·</span>
                                        <Typography variant={"caption"}>{abbrNum(node.followersCount)} Followers</Typography>
                                        <span>·</span>
                                        <Typography variant={"caption"}>{abbrNum(node.followingCount)} Followings</Typography>
                                    </div>
                                    <div className={classes.tooltipAccountInfo}>
                                        <Typography variant={"body2"}>Public Twitter account</Typography>
                                        {node.private ? <CloseIcon color={"error"} /> : <CheckIcon color={"success"} />}
                                    </div>
                                    {
                                        instagramLookupState && <>
                                            <div className={classes.tooltipAccountInfo}>
                                                <Typography variant={"body2"}>Instagram account</Typography>
                                                {!node.instagram ? <CloseIcon color={"error"} /> : <CheckIcon color={"success"} />}
                                            </div>
                                            {
                                                node.instagram && <>
                                                    <div className={classes.tooltipAccountInfo}>
                                                        <Typography variant={"body2"}>Public Insta account</Typography>
                                                        {node.instagram.private ? <CloseIcon color={"error"} /> : <CheckIcon color={"success"} />}
                                                    </div>
                                                    <div className={classes.tooltipInstagramPosts}>
                                                        {
                                                            !node.instagram.private && node.instagram.posts.map((val, i) => {
                                                                if (i > 1) return;
                                                                return <img className={classes.tooltipInstagramPost} src={val} key={i} alt={i} />
                                                            })
                                                        }
                                                    </div>
                                                </>
                                            }
                                        </>
                                    }
                                    <Typography textAlign={"center"}>Click to see more information</Typography>
                                    <Typography textAlign={"center"} variant={"caption"} component={"div"}>Depth {node.depth}</Typography>
                                </div>
                            </> :
                            <>
                                <Typography textAlign={"center"}>User doesn't exists or failed to fetch.</Typography>
                            </>
                        }
                    </Container>
                </Paper>
            </>
        }
        return ReactDOMServer.renderToString(tooltip(node));
    }
    const linkParticles = (link) => {
        return 1 + Math.floor((link.val - 1) / 2);
    }
    let lastClick = 0;
    const onNodeClick = (node, event) => {
        if (event.timeStamp - lastClick <= 500) {
            setTarget(node.screenName);
            requestData(node.screenName, tweetLimit, relationLimit, instagramLookupState, depth);
        } else {
            lastClick = event.timeStamp;
            setSelectedNode(node);
        }
    };

    const handleTargetChange = (event) => {
        setTarget(event.target.value);
    }
    const handleTargetKeyPress = async (event) => {
        if (event.keyCode === 13 && target !== "") {
            await requestData(event.target.value, tweetLimit, relationLimit, instagramLookupState, depth);
        }
    }
    const handleTweetLimitChange = (_, value) => {
        setTweetLimit(value);
    }
    const handleRelationLimitChange = (_, value) => {
        setRelationLimit(value);
    }
    const handleDepthChange = (_, value) => {
        setDepth(value);
    }
    const handleAnimationStateChange = () => {
        setAnimationState(!animationState);
    }
    const handleInstagramLookupStateChange = () => {
        seInstagramLookupState(!instagramLookupState);
    }
    const onClickSearch = async () => {
        if (target !== "") {
            await requestData(target, tweetLimit, relationLimit, instagramLookupState, depth);
        }
    }

    const onClickOpenDialog = (type) => {
        setDialogData({ state: true, type: type });
    }
    const handleDialogClose = (event, reason) => {
        if (reason === "backdropClick" && dialogData.type === "loading") {
            // clearLoading()
        } else {
            setDialogData({ ...dialogData, state: false });
        }
    }


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
            Warning: Above 20 relations, you may experience lags.`}
                    >
                        <div className={classes.slider}>
                            <Slider
                                classes={{
                                    root: classes.sliderRoot,
                                    thumb:
                                        relationLimit < 20
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
                                    relationLimit < 20
                                        ? classes.sliderThumb
                                        : classes.sliderWarning
                                }
                            >
                                {relationLimit} Relations.
                            </Typography>
                        </div>
                    </Tooltip>
                    <Tooltip
                        title={`Depth of your search.`}
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
                                    depth < 3
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
                    <Tooltip 
                        title={`You are going to lookup around ${abbrNum(Math.pow(relationLimit, depth))} twitter account and ${abbrNum(Math.pow(relationLimit, depth) * tweetLimit)} tweets. It might take long.`}>
                        <span>
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
                        </span>
                    </Tooltip>
                </Toolbar>
            </AppBar>
            <main className={classes.mainContainer}>
                <ForceGraph2D
                    graphData={graphData}
                    height={graphSize.height}
                    width={graphSize.width}
                    nodeLabel={graphTooltip}
                    linkDirectionalParticles={animationState ? linkParticles : 0}
                    linkDirectionalParticlesSpeed={animationState ? linkParticles : 0}
                    linkOpacity={0.4}
                    onNodeClick={onNodeClick}
                />
                <Box className={classes.informationPanel}>
                    <Accordion expanded={!!selectedNode}>
                        <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                        >
                            <Typography>Information</Typography>
                        </AccordionSummary>
                        <AccordionDetails className={classes.informationPanelDetails}>
                            <Typography textAlign={"center"}>The current graph has {graphData.nodes.length} nodes and {graphData.links.length} links.</Typography>
                            <br />
                            {
                                selectedNode ? <>
                                    {
                                        selectedNode.available ? <>
                                            <div className={classes.tooltipHeader}>
                                                <Avatar
                                                    className={classes.tooltipAvatar}
                                                    src={selectedNode.profilePictureUrl}
                                                />
                                                <div className={classes.tooltipName}>
                                                    <Typography>{selectedNode.name}</Typography>
                                                    <Typography variant={"caption"}>@{selectedNode.screenName}</Typography>
                                                    <Typography variant={"caption"}>ID: {selectedNode.userId}</Typography>
                                                </div>
                                            </div>
                                            <div className={classes.tooltipBody}>
                                                <Typography className={classes.tooltipSocialsDescription}>{selectedNode.description}</Typography>
                                                <div className={classes.tooltipSocialsInfo}>
                                                    <Typography variant={"caption"}>{abbrNum(selectedNode.tweetCount)} Tweets</Typography>
                                                    <span>·</span>
                                                    <Typography variant={"caption"}>{abbrNum(selectedNode.followersCount)} Followers</Typography>
                                                    <span>·</span>
                                                    <Typography variant={"caption"}>{abbrNum(selectedNode.followingCount)} Followings</Typography>
                                                </div>
                                                <Typography variant={"caption"} textAlign={"center"} component={"div"}>
                                                    Account creation: {moment(selectedNode.createdAt).format("D MMMM YYYY")}
                                                </Typography>
                                                {
                                                    selectedNode.birthdate && 
                                                    <>
                                                        <Typography variant={"caption"} textAlign={"center"} component={"div"}>
                                                            Birthdate: {moment().month(selectedNode.birthdate.month - 1).date(selectedNode.birthdate.day).format("D MMMM")}
                                                        </Typography>
                                                    </>
                                                }
                                                <div className={classes.tooltipAccountInfo}>
                                                    <Typography variant={"body2"}>Public Twitter account</Typography>
                                                    {selectedNode.private ? <CloseIcon color={"error"} /> : <CheckIcon color={"success"} />}
                                                </div>
                                                {
                                                    instagramLookupState && <>
                                                        <div className={classes.tooltipAccountInfo}>
                                                            <Typography variant={"body2"}>Instagram account</Typography>
                                                            {!selectedNode.instagram ? <CloseIcon color={"error"} /> : <CheckIcon color={"success"} />}
                                                        </div>
                                                        {
                                                            selectedNode.instagram && <>
                                                                <Typography className={classes.tooltipSocialsDescription}>{selectedNode.instagram.description}</Typography>
                                                                <div className={classes.tooltipSocialsInfo}>
                                                                    <Typography variant={"caption"}>{abbrNum(Number(selectedNode.instagram.postCount))} Posts</Typography>
                                                                    <span>·</span>
                                                                    <Typography variant={"caption"}>{abbrNum(Number(selectedNode.instagram.followerCount))} Followers</Typography>
                                                                    <span>·</span>
                                                                    <Typography variant={"caption"}>{abbrNum(Number(selectedNode.instagram.followingCount))} Followings</Typography>
                                                                </div>
                                                                {
                                                                    selectedNode.instagram && <>
                                                                        <div className={classes.tooltipAccountInfo}>
                                                                            <Typography variant={"body2"}>Public Insta account</Typography>
                                                                            {selectedNode.instagram.private ? <CloseIcon color={"error"} /> : <CheckIcon color={"success"} />}
                                                                        </div>
                                                                        <div className={classes.tooltipInstagramPosts}>
                                                                            {
                                                                                !selectedNode.instagram.private && selectedNode.instagram.posts.map((val, i) => {
                                                                                    return <img className={classes.tooltipInstagramPost} src={val} key={i} alt={i} />
                                                                                })
                                                                            }
                                                                        </div>
                                                                    </>
                                                                }
                                                            </>
                                                        }
                                                    </>
                                                }
                                                <div style={{display: "flex", justifyContent: "space-around"}}>
                                                    <Link href={'https://www.twitter.com/' + selectedNode.screenName}>Twitter</Link>
                                                    {
                                                        selectedNode.instagram && <Link href={'https://www.instagram.com/' + selectedNode.instagram.name}>Instagram</Link>
                                                    }
                                                </div>
                                                <Typography textAlign={"center"} variant={"caption"} component={"div"}>Depth {selectedNode.depth}</Typography>
                                            </div>
                                        </>
                                        :
                                        <>
                                            <Typography textAlign={"center"}>User doesn't exists or failed to fetch.</Typography>
                                        </>
                                    }
                                </>
                                :
                                <>
                                    <Typography textAlign={"center"}>Click on a node to learn more</Typography>
                                </>
                            }
                        </AccordionDetails>
                    </Accordion>
                </Box>
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
                onClose={handleDialogClose}
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
                                                value={Math.min(
                                                    (getLoadingCounter(loadingTime, loadingData) * 100) /
                                                    loadingData.relations,
                                                    100
                                                )}
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
                                            <Typography component="div">
                                                {Math.max(0, Math.min(
                                                        getLoadingCounter(loadingTime, loadingData),
                                                        loadingData.relations
                                                ))} / {loadingData.relations}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Typography variant={"h6"}>
                                        Estimated time left:{" "}
                                        {loadingData.timeStart !== 0 &&
                                            loadingTime !== 0 &&
                                            getLoadingCounter(loadingTime, loadingData) <
                                            loadingData.relations
                                            ? `~${(
                                                (loadingData.timeAvg * loadingData.relations -
                                                    getLoadingCounter(loadingTime, loadingData) *
                                                    loadingData.timeAvg) /
                                                1000
                                            ).toFixed(1)}s`
                                            : "In few seconds"}
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
                                {relationLimit} · Instagram lookup: {instagramLookupState.toString()} · Depth: {depth}
                            </Typography>
                            {loadingData.timeStart !== 0 &&
                                loadingTime !== 0 &&
                                loadingData.error === "" && (
                                    <>
                                        <br />
                                        <Typography variant={"caption"}>
                                            Relations: ~{loadingData.relations} · Avg time/rel:{" "}
                                            {loadingData.timeAvg}ms
                                        </Typography>
                                    </>
                                )}
                        </DialogContent>
                        {loadingData.error !== "" && (
                            <DialogActions>
                                <Button
                                    onClick={handleDialogClose}
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
