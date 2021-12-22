import { nextTick } from "process"

let ctx: CanvasRenderingContext2D
let width: number
let height: number
let images: Img[]
let size: number
let map: any[]
let scale: number
let next_stage_call_back: Function
let stage: number

interface Img {
    id: number,
    img: HTMLImageElement
}

const init = (c: CanvasRenderingContext2D, w: number, h: number, i: Img[], s: number) => {
    ctx = c;
    width = w;
    height = h;
    scale = s;
    images = i;
}

const screen = (m: any[], s: number) => {
    map = JSON.parse(JSON.stringify(m));
    size = width / map.length
    stage = s
    console.log(s)
    draw()
}

const draw = () => {
    ctx.fillStyle = "#000"
    ctx.fillRect(0, 0, width, height);
    map.forEach((line: any[], y: number) => {
        line.forEach((item: number, x: number) => {
            if (item != 0) {
                ctx.drawImage(images.filter(img => {
                    return img.id === item
                })[0].img, x * size, y * size, size, size)
            }
        })
    })
}

const on_next = (fn: Function) => {
    next_stage_call_back = fn
}


const get_map = (x: number, y: number) => {
    return map[y][x]
}
const set_map = (x: number, y: number, value: number) => {
    map[y][x] = value
}
const find_player = () => {
    let at = null
    map.forEach((line: any[], y: number) => {
        line.forEach((item: number, x: number) => {
            if (item == 8) {
                at = {
                    x,
                    y
                }
            }
        })
    })
    return at
}

const move = (id: number, from: any[], to: any[], callback: Function) => {
    const target = get_map(to[0], to[1])
    if (target == 0) {
        set_map(from[0], from[1], 0)
        set_map(to[0], to[1], id)
        if (callback) {
            console.log('callback')
            callback()
        }
    }
    if (target == 3) {
        const next_to = [to[0] - from[0] + to[0], to[1] - from[1] + to[1]]
        move(3, to, next_to, () => {
            console.log('cbm')
            move(id, from, to, callback)
        })
    }
    if (target == 2 && id == 8) {
        set_map(from[0], from[1], 0)
        set_map(to[0], to[1], 9)
        // next stage
        next_stage_call_back(stage)
    }
}

const key = {
    up: () => {
        const at = find_player()
        if (at) {
            const {
                x,
                y
            } = at
            move(8, [x, y], [x, y - 1], () => { })
            draw()
        }
    },
    down: () => {
        const at = find_player()
        if (at) {
            const {
                x,
                y
            } = at
            move(8, [x, y], [x, y + 1], () => { })
            draw()
        }
    },
    left: () => {
        const at = find_player()
        if (at) {
            const {
                x,
                y
            } = at
            move(8, [x, y], [x - 1, y], () => { })
            draw()
        }
    },
    right: () => {
        const at = find_player()
        if (at) {
            const {
                x,
                y
            } = at
            move(8, [x, y], [x + 1, y], () => { })
            draw()
        }
    }
}

export {
    init,
    screen,
    draw,
    on_next,
    key
}