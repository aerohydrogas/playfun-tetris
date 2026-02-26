// Play.fun Integration
let playFun = null;

export function initPlayFun() {
    if (window.PlayFun) {
        playFun = window.PlayFun.init({
            // Optional configuration
        });
        console.log("PlayFun initialized");
    } else {
        console.warn("PlayFun SDK not found");
    }
}

export function reportScore(score) {
    if (playFun) {
        playFun.submitScore(score);
        console.log("Score reported to PlayFun:", score);
    }
}

export function getPlayFun() {
    return playFun;
}
