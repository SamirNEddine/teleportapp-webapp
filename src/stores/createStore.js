//Source: https://github.com/facebook/react/issues/15738
const createStore = ({name = ''} = {}) => {
    return (() => {
        const subscriptions = [];
        return {
            isReady: false,
            name,
            dispatch: function () {
                console.error(`store ${this.name}: is NOT ready`)
            },
            getState: () => null, // method will be updated by init
            subscribe: function (callback) {
                subscriptions.push(callback)
            },
            __onStateUpdated: function () {
                subscriptions.forEach(fn => fn())
            },
            init: function ({dispatch, getState}) {
                if (this.isReady) return;
                this.isReady = true;
                this.dispatch = dispatch;
                this.getState = getState;
                Object.freeze(this)
            },
        }
    })()
};

export default createStore;