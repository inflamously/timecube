type TimeSpan = number

type TimeState = {
    time: TimeSpan
}

const timeState = $state<TimeState>({
    time: 10
})

export function selectTime() {
    return timeState.time
}