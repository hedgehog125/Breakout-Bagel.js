let game = Bagel.init({
    game: {
        assets: {
            snds: [
                {
                    id: "Bounce1",
                    src: "assets/snds/bump.mp3"
                },
                {
                    id: "Bounce2",
                    src: "assets/snds/bump2.mp3"
                }
            ]
        },
        sprites: [
            {
                id: "Bricks",
                type: "canvas",
                width: 1,
                height: 1,
                mode: "static",
                fullRes: false,
                updateRes: false,
                clones: {
                    prerender: (me, game, ctx) => {
                        ctx.fillStyle = me.vars.colour;
                        ctx.fillRect(0, 0, 1, 1);
                    },
                    scripts: {
                        init: [
                            me => {
                                me.visible = true;
                                me.width = 50;
                                me.height = 15;
                                me.x += me.width / 2;
                                me.y += me.height / 2;
                            }
                        ]
                    }
                },
                scripts: {
                    init: [
                        {
                            code: me => {
                                me.visible = false;
                                let x = 0;
                                let y = 45;
                                let i = 0;
                                while (i < 30) {
                                    let colour;
                                    if ((parseInt(i) + (y / 15)) % 2 == 0) {
                                        colour = "red";
                                    }
                                    else {
                                        colour = "darkred";
                                    }

                                    me.clone({
                                        x: x,
                                        y: y,
                                        vars: {
                                            colour: colour
                                        }
                                    });

                                    x += 50;
                                    if (x >= game.width) {
                                        x = 0;
                                        y += 15;
                                    }

                                    i++;
                                }
                            },
                            stateToRun: "game"
                        }
                    ],
                    main: [
                        {
                            code: me => {
                                if (me.cloneCount == 0) {
                                    game.state = "gameOver";
                                    game.vars.won = true;
                                }
                            },
                            stateToRun: "game"
                        }
                    ]
                }
            },
            {
                id: "Ball",
                type: "canvas",
                mode: "static",
                width: 30,
                height: 30,
                fullRes: true,
                vars: {
                    colours: ["black", "red", "gold", "pink", "purple"]
                },
                prerender: (me, game, ctx, canvas, scaleX) => {
                    ctx.fillStyle = me.vars.colours[me.vars.colour];
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.beginPath();
                    ctx.arc(canvas.width / 2, canvas.height / 2, (15 * scaleX) - 1, 0, Math.PI * 2, false);
                    ctx.fill();
                    ctx.closePath();
                },
                scripts: {
                    steps: {
                        playSound: me => {
                            if (Math.random() > 0.5) {
                                if (game.get.asset.snd("Bounce2").paused) {
                                    game.playSound("Bounce1", Math.abs(me.vars.move.x) / 10);
                                }
                            }
                            else {
                                if (game.get.asset.snd("Bounce1").paused) {
                                    game.playSound("Bounce2", Math.abs(me.vars.move.x) / 10);
                                }
                            }
                        },
                        bounceX: (me, game, step) => {
                            me.vars.move.x *= -1;
                            me.x += me.vars.move.x;
                            step("playSound");
                        },
                        bounceY: (me, game, step) => {
                            me.vars.move.y *= -1;
                            me.y += me.vars.move.y;
                            step("playSound");

                            me.vars.colour++;
                            if (me.vars.colour == me.vars.colours.length) {
                                me.vars.colour = 0;
                            }
                            me.prerender();
                        }
                    },
                    init: [
                        {
                            code: (me, game, step) => {
                                me.x = 400;
                                me.y = game.height / 3;

                                me.vars.colour = 0;
                                me.vars.move = {
                                    x: -3,
                                    y: 3
                                };
                                me.vars.stuck = false;
                            },
                            stateToRun: "game"
                        }
                    ],
                    main: [
                        {
                            code: (me, game, step) => {
                                me.x += me.vars.move.x;
                                me.y += me.vars.move.y;
                                if (me.touching.sprite("Bat")) {
                                    step("bounceY");
                                    let bat = me.last.collision.sprite;
                                    if (Math.random() > 0.5 || bat.width < 50) {
                                        let move = me.vars.move;
                                        if (move.x > 0) {
                                            move.x += game.vars.speedUpRate;
                                        }
                                        else {
                                            move.x -= game.vars.speedUpRate;
                                        }
                                        if (move.y > 0) {
                                            move.y += game.vars.speedUpRate;
                                        }
                                        else {
                                            move.y -= game.vars.speedUpRate;
                                        }
                                    }
                                    else {
                                        bat.width -= game.vars.shrinkRate;
                                    }
                                    if (me.vars.stuck) {
                                        me.y = bat.y - (bat.height / 2) - (me.height / 2) - 1;
                                    }
                                    me.vars.stuck = true;
                                }
                                else {
                                    me.vars.stuck = false;
                                }
                                if (me.x + (me.width / 2) >= game.width - 1 || me.x - (me.width / 2) <= 0) {
                                    step("bounceX");
                                }
                                if (me.y - (me.height / 2) <= 0) {
                                    step("bounceY");
                                }
                                if (me.y - me.height > game.height) {
                                    game.state = "gameOver";
                                }

                                if (me.touching.sprite("Bricks")) {
                                    step("bounceY");
                                    game.vars.score++;
                                    me.last.collision.sprite.delete();
                                }
                            },
                            stateToRun: "game"
                        }
                    ]
                }
            },
            {
                id: "Bat",
                type: "canvas",
                width: 1,
                height: 1,
                mode: "static",
                fullRes: false,
                updateRes: false,
                prerender: (me, game, ctx) => {
                    ctx.fillStyle = "blue";
                    ctx.fillRect(0, 0, 1, 1);
                },
                scripts: {
                    init: [
                        {
                            code: me => {
                                me.width = 125;
                                me.height = 25;
                                me.x = "centred";
                                me.y = game.height - (me.height / 2);
                                me.vars.vel = 0;
                            },
                            stateToRun: "game"
                        }
                    ],
                    main: [
                        {
                            code: me => {
                                let vars = me.vars;
                                let input = game.input;
                                let isDown = input.keys.isDown;
                                if (
                                    isDown(input.lookup.left)
                                    || isDown(input.lookup.a)
                                ) {
                                    vars.vel -= 3;
                                }
                                else {
                                    if (game.input.mouse.down && game.input.mouse.x < me.x) {
                                        me.x -= Math.min(11, me.x - game.input.mouse.x);
                                        vars.vel = 0;
                                    }
                                    if (vars.vel < 0) {
                                        vars.vel += 0.05;
                                    }
                                }
                                if (
                                    isDown(input.lookup.right)
                                    || isDown(input.lookup.d)
                                ) {
                                    vars.vel += 3;
                                }
                                else {
                                    if (game.input.mouse.down && game.input.mouse.x > me.x) {
                                        me.x += Math.min(11, game.input.mouse.x - me.x);
                                        vars.vel = 0;
                                    }
                                    if (vars.vel > 0) {
                                        vars.vel -= 0.05;
                                    }
                                }

                                me.x += vars.vel;
                                vars.vel *= 0.8;

                                if (me.x + (me.width / 2) > game.width) {
                                    me.x = game.width - (me.width / 2) + 1;
                                }
                                if (me.x < me.width / 2) {
                                    me.x = me.width / 2;
                                }
                            },
                            stateToRun: "game"
                        }
                    ]
                }
            },

            {
                type: "text",
                text: "",
                id: "GameOverText",
                vars: {
                    delay: 0,
                    dir: 1
                },
                clones: {
                    scripts: {
                        init: [
                            me => {
                                me.alpha = 0;
                                me.vars.vel = 0;
                            }
                        ],
                        main: [
                            me => {
                                if (me.vars.delay == 0) {
                                    if (me.vars.dir == 1) {
                                        if (me.alpha < 1) {
                                            me.vars.vel += 0.005;
                                        }
                                        else {
                                            if (me.vars.vel < 0.01 && game.input.mouse.down) {
                                                if (me.cloneID == 2) {
                                                    let firstLine = me.vars.firstLine;
                                                    let secondLine = me.vars.secondLine;

                                                    firstLine.vars.delay = 50;
                                                    secondLine.vars.delay = 20;

                                                    me.vars.dir = -1;
                                                    me.vars.vel = 0;
                                                    firstLine.vars.dir = -1;
                                                    firstLine.vars.vel = 0;
                                                    secondLine.vars.dir = -1;
                                                    secondLine.vars.vel = 0;
                                                }
                                            }
                                        }
                                        me.alpha += me.vars.vel;
                                        me.y -= me.vars.vel * 40;

                                        me.vars.vel *= 0.9;
                                        if (me.alpha > 1) {
                                            me.alpha = 1;
                                        }
                                    }
                                    else {
                                        if (me.alpha > 0) {
                                            me.vars.vel -= 0.0125;
                                        }
                                        else {
                                            if (me.cloneID == 0) {
                                                game.state = "game";
                                                game.vars.won = false;
                                                game.vars.score = 0;
                                            }
                                        }
                                        me.alpha += me.vars.vel;
                                        me.y -= me.vars.vel * 40;

                                        me.vars.vel *= 0.87;
                                        if (me.alpha < 0) {
                                            me.alpha = 0;
                                            me.visible = false;
                                        }
                                    }

                                }
                                else {
                                    me.vars.delay--;
                                }
                            }
                        ]
                    }
                },

                scripts: {
                    init: [
                        {
                            code: me => {
                                let firstLine = me.clone({
                                    text: game.vars.won? "You win!" : "Game Over!",
                                    y: (game.height / 2) + 58
                                });
                                let secondLine = me.clone({
                                    text: "Click to play again...",
                                    y: (game.height / 2) + 88,
                                    font: "15px Helvetica",
                                    vars: {
                                        delay: 50
                                    }
                                });
                                me.clone({
                                    text: "Score: " + game.vars.score,
                                    y: (game.height / 2) + 108,
                                    font: "15px Helvetica",
                                    vars: {
                                        delay: 80,
                                        firstLine: firstLine,
                                        secondLine: secondLine
                                    }
                                });
                                me.visible = false;
                            },
                            stateToRun: "gameOver"
                        }
                    ]
                }
            }
        ]
    },
    id: "Game",
    state: "game",
    width: 500,
    height: 320,
    vars: {
        score: 0,
        shrinkRate: 5,
        speedUpRate: 0.15
    }
});
