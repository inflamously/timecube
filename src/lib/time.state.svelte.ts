import {produce} from "immer";

type TimeState = {
    time: number
    counter: number,
    state: 'stop' | 'start' | 'restart' | 'pause'
}

export const actions = {
    start: (time: number) => ({
        type: 'start',
        data: {
            time
        }
    }),
    stop: () => ({
        type: 'stop',
        data: {
            time: 0
        }
    }),
    restart: () => ({
        type: 'restart',
    }),
    pause: () => ({
        type: 'pause'
    })
}

let timeState = $state<TimeState>({
    time: 0,
    counter: 0,
    state: 'stop'
})

export function dispatch(action: {
    type: TimeState["state"],
    data: TimeState
}) {
    timeState = produce(timeState, (draft) => {
        switch (action.type) {
            case "start":
                draft.time = action.data.time
                break;
            case "stop":
                break
        }
    })
}

export function selectTime() {
    return timeState.time
}