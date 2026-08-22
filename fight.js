export function startFight(
    app,
    menu,
    audio,
    fighter1,
    fighter2
) {

    let canvas;
    let ctx;

    let width = 0;
    let height = 0;

    let running = true;

    let round = 1;

    let wins = [0, 0];

    let roundTime = 60;

    let lastTime =
        performance.now();

    const keys = {};

    function createFighter(
        fighter,
        x
    ) {

        return {

            fighter,

            hp: fighter.hp,

            maxHp: fighter.hp,

            energy: 120,

            x,

            combo: 0,

            blocking: false,

            cooldowns: [
                0,
                0,
                0,
                0
            ],

            dodge: 0
        };
    }

    app.innerHTML = `

        <main class="fight">

            <div class="fight-hud">

                <div class="hp-row">

                    <div class="hp hp-player">
                        <div id="hp1"></div>
                    </div>

                    <div
                        class="round"
                        id="round"
                    >
                        1/3
                    </div>

                    <div class="hp hp-enemy">
                        <div id="hp2"></div>
                    </div>

                </div>

                <div class="fighter-names">

                    <span>
                        ${fighter1.ru}
                    </span>

                    <span>
                        ${fighter2.ru}
                    </span>

                </div>

                <div class="energy-row">

                    <div class="energy">
                        <div id="energy1"></div>
                    </div>

                    <div class="energy">
                        <div id="energy2"></div>
                    </div>

                </div>

            </div>

            <div class="arena">

                <canvas
                    class="game-canvas"
                ></canvas>

                <div
                    class="fight-message"
                    id="message"
                ></div>

            </div>

            <div class="controls">

                <div
                    class="joystick"
                    id="joystick"
                >
                    <div
                        class="joystick-knob"
                        id="joystickKnob"
                    ></div>
                </div>

                <button
                    class="block-button"
                    id="block"
                >
                    🛡 БЛОК
                </button>

                <div
                    class="skill-row"
                    id="skills"
                ></div>

            </div>

        </main>
    `;

    canvas =
        app.querySelector(
            ".game-canvas"
        );

    ctx =
        canvas.getContext("2d");

    let player =
        createFighter(
            fighter1,
            width * .28
        );

    let enemy =
        createFighter(
            fighter2,
            width * .72
        );

    function resize() {

        const rect =
            canvas.getBoundingClientRect();

        const dpr =
            window.devicePixelRatio || 1;

        width = rect.width;

        height = rect.height;

        canvas.width =
            width * dpr;

        canvas.height =
            height * dpr;

        ctx.setTransform(
            dpr,
            0,
            0,
            dpr,
            0,
            0
        );

        if (player) {
            player.x =
                Math.min(
                    player.x,
                    width - 40
                );
        }

        if (enemy) {
            enemy.x =
                Math.min(
                    enemy.x,width - 40
                );
        }
    }

    resize();

    window.addEventListener(
        "resize",
        resize
    );

    /* =========================
       SKILLS
    ========================= */

    const skills =
        document.getElementById(
            "skills"
        );

    fighter1.skills.forEach(
        (skill, index) => {

            const button =
                document.createElement(
                    "button"
                );

            button.className =
                "skill";

            if (index === 3) {
                button.classList.add(
                    "ultimate"
                );
            }

            button.innerHTML = `

                ${
                    ["Q", "W", "E", "R"]
                    [index]
                }

                <span class="skill-name">
                    ${skill}
                </span>

                <span class="cooldown"></span>
            `;

            button.onpointerdown =
                event => {

                    event.preventDefault();

                    useSkill(index);
                };

            skills.appendChild(
                button
            );
        }
    );

    /* =========================
       DAMAGE
    ========================= */

    function dealDamage(
        attacker,
        target,
        amount
    ) {

        if (target.dodge > 0) {

            showMessage(
                "MISS",
                "#9fcfff"
            );

            return;
        }

        if (
            target.blocking
        ) {

            amount *= .45;
        }

        let critical =
            Math.random() < .10;

        if (critical) {

            amount *= 1.5;

            audio.crit();

            showMessage(
                "CRIT!",
                "#ffd34d"
            );

        } else {

            audio.hit();
        }

        if (
            attacker.combo >= 3
        ) {

            amount *= 1.5;

            attacker.combo = 0;

            showMessage(
                "COMBO!",
                "#ff8f45"
            );
        }

        target.hp =
            Math.max(
                0,
                target.hp - amount
            );

        attacker.combo++;
    }

    /* =========================
       SKILL LOGIC
    ========================= */

    const costs = [
        10,
        15,
        20,
        50
    ];

    const cooldowns = [
        4000,
        8000,
        10000,
        35000
    ];

    const damages = [
        25,
        0,
        20,
        65
    ];

    function useSkill(index) {

        if (!running) {
            return;
        }

        const cost =
            costs[index];

        if (
            player.energy <
            cost
        ) {

            showMessage(
                "НЕТ ЭНЕРГИИ",
                "#9aa5b5"
            );

            return;
        }

        if (
            player.cooldowns[index] > 0
        ) {
            return;
        }

        player.energy -= cost;

        player.cooldowns[index] =
            cooldowns[index];

        audio.skill();

        /*
            Q — атака
            W — рывок
            E — временный щит
            R — мощная атака
        */

        if (index === 0) {

            if (
                distance() < 260
            ) {

                dealDamage(
                    player,
                    enemy,
                    damages[index]
                );
            }

        } else if (index === 1) {

            player.x +=
                enemy.x > player.x
                    ? 100
                    : -100;

            player.x =
                Math.max(
                    40,
                    Math.min(
                        width - 40,
                        player.x
                    )
                );

        } else if (index === 2) {

            player.blocking = true;

            setTimeout(() => {player.blocking =
                    false;

            }, 900);

        } else if (index === 3) {

            if (
                distance() < 330
            ) {

                dealDamage(
                    player,
                    enemy,
                    damages[index]
                );
            }

            showMessage(
                "ULTIMATE!",
                "#ff4e68"
            );
        }
    }

    function distance() {

        return Math.abs(
            player.x -
            enemy.x
        );
    }

    /* =========================
       AI
    ========================= */

    let aiTimer = 0;

    function updateAI(
        dt
    ) {

        aiTimer -= dt;

        const d =
            distance();

        if (d > 110) {

            enemy.x +=
                Math.sign(
                    player.x -
                    enemy.x
                ) *
                enemy.fighter.speed *
                42 *
                dt;

        } else {

            if (
                aiTimer <= 0
            ) {

                aiTimer =
                    .5 +
                    Math.random() *
                    .9;

                const action =
                    Math.random();

                if (action < .2) {

                    enemy.blocking =
                        true;

                    setTimeout(() => {

                        enemy.blocking =
                            false;

                    }, 500);

                } else {

                    dealDamage(
                        enemy,
                        player,
                        enemy.fighter.damage
                    );
                }
            }
        }

        enemy.x =
            Math.max(
                40,
                Math.min(
                    width - 40,
                    enemy.x
                )
            );
    }

    /* =========================
       MESSAGE
    ========================= */

    function showMessage(
        text,
        color = "#fff"
    ) {

        const element =
            document.getElementById(
                "message"
            );

        element.textContent =
            text;

        element.style.color =
            color;

        element.animate(
            [
                {
                    opacity: 0,
                    transform:
                        "scale(.7)"
                },

                {
                    opacity: 1,
                    transform:
                        "scale(1)"
                },

                {
                    opacity: 0,
                    transform:
                        "scale(1.15)"
                }
            ],
            {
                duration: 700
            }
        );
    }

    /* =========================
       ROUND END
    ========================= */

    function endRound(
        winner
    ) {

        if (!running) {
            return;
        }

        wins[winner]++;

        audio.knockout();

        showMessage(
            "KNOCKOUT!",
            "#ffd34d"
        );

        if (
            wins[winner] >= 2 ||
            round >= 3
        ) {

            setTimeout(
                finishFight,
                900
            );

            return;
        }

        setTimeout(() => {

            round++;

            roundTime = 60;

            player =
                createFighter(
                    fighter1,
                    width * .28
                );

            enemy =
                createFighter(
                    fighter2,
                    width * .72
                );

        }, 1000);
    }

    /* =========================
       FINAL
    ========================= */

    function finishFight() {

        running = false;

        const winner =
            wins[0] >= wins[1]
                ? fighter1
                : fighter2;

        const fatality =
            winner.fatalities[
                Math.floor(
                    Math.random() *
                    winner.fatalities.length
                )
            ];

        const result =
            document.createElement(
                "div"
            );

        result.className =
            "result";

        result.innerHTML = `

            <div class="result-box">

                <h1>
                    ☠ FATALITY
                </h1>

                <h2>
                    ${winner.ru}
                </h2>

                <p>
                    ${fatality}
                </p>

                <p>
                    Раунды:
                    ${wins[0]}
                    :
                    ${wins[1]}
                </p>

                <button
                    class="primary"
                    id="again"
                >
                    Ещё бой
                </button>

                <button
                    id="menu"
                >
                    Главное меню
                </button>

            </div>
        `;

        app.appendChild(
            result
        );

        result.querySelector(
            "#again"
        ).onclick = () => {

            result.remove();

            round = 1;

            wins = [0, 0];

            roundTime = 60;

            player =
                createFighter(
                    fighter1,
                    width * .28
                );

            enemy =
                createFighter(
                    fighter2,
                    width * .72
                );

            running = true;

            lastTime =
                performance.now();

            requestAnimationFrame(
                gameLoop
            );
        };

        result.querySelector(
            "#menu"
        ).onclick = menu;
    }

    /* =========================
       DRAW CHARACTER
    ========================= */

    function drawFighter(
        fighter,
        isEnemy
    ) {

        const x =
            fighter.x;

        const ground =
            height * .78;

        ctx.save();

        ctx.strokeStyle =
            fighter.fighter.color;

        ctx.fillStyle =
            "#10151c";

        ctx.lineWidth = 3;

        ctx.shadowColor =
            fighter.fighter.color;

        ctx.shadowBlur = 18;

        /*
            голова
        */

        ctx.beginPath();

        ctx.arc(
            x,
            ground - 80,
            18,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.stroke();

        /*
            корпус
        */

        ctx.beginPath();

        ctx.roundRect(
            x - 12,
            ground - 62,
            24,
            52,
            8
        );

        ctx.stroke();

        /*
            руки
        */

        ctx.lineWidth = 7;

        ctx.beginPath();

        ctx.moveTo(
            x - 8,
            ground - 48
        );

        ctx.lineTo(
            x - 32,
            ground - 20
        );

        ctx.moveTo(
            x + 8,
            ground - 48
        );

        ctx.lineTo(
            x +
            (isEnemy ? -32 : 32),
            ground - 25
        );

        /*
            ноги
        */

        ctx.moveTo(
            x - 7,
            ground - 10
        );

        ctx.lineTo(
            x - 18,
            ground + 25
        );

        ctx.moveTo(
            x + 7,
            ground - 10
        );

        ctx.lineTo(
            x + 18,
            ground + 25
        );

        ctx.stroke();

        /*
            блок
        */

        if (
            fighter.blocking
        ) {

            ctx.strokeStyle =
                "#6ec8ff";

            ctx.lineWidth = 5;

            ctx.beginPath();

            ctx.arc(
                x,
                ground - 45,
                45,
                0,
                Math.PI * 2
            );

            ctx.stroke();}

        ctx.restore();
    }

    /* =========================
       GAME LOOP
    ========================= */

    function gameLoop(
        now
    ) {

        if (!running) {
            return;
        }

        const dt =
            Math.min(
                .033,
                (now - lastTime) /
                1000
            );

        lastTime = now;

        roundTime -= dt;

        /*
            энергия
        */

        player.energy =
            Math.min(
                120,
                player.energy +
                1.5 * dt
            );

        enemy.energy =
            Math.min(
                120,
                enemy.energy +
                1.5 * dt
            );

        /*
            cooldown
        */

        player.cooldowns =
            player.cooldowns.map(
                value =>
                    Math.max(
                        0,
                        value -
                        dt * 1000
                    )
            );

        /*
            управление
        */

        if (
            keys.left
        ) {

            player.x -=
                130 *
                player.fighter.speed *
                dt;
        }

        if (
            keys.right
        ) {

            player.x +=
                130 *
                player.fighter.speed *
                dt;
        }

        player.x =
            Math.max(
                40,
                Math.min(
                    width - 40,
                    player.x
                )
            );

        updateAI(dt);

        /*
            раунд по HP
        */

        if (
            player.hp <= 0
        ) {

            endRound(1);

        } else if (
            enemy.hp <= 0
        ) {

            endRound(0);
        }

        /*
            время
        */

        if (
            roundTime <= 0
        ) {

            if (
                player.hp >= enemy.hp
            ) {

                endRound(0);

            } else {

                endRound(1);
            }

            roundTime = 60;
        }

        /*
            render
        */

        ctx.clearRect(
            0,
            0,
            width,
            height
        );

        drawFighter(
            player,
            false
        );

        drawFighter(
            enemy,
            true
        );

        /*
            HUD
        */

        document.getElementById(
            "hp1"
        ).style.width =
            (
                player.hp /
                player.maxHp *
                100
            ) + "%";

        document.getElementById(
            "hp2"
        ).style.width =
            (
                enemy.hp /
                enemy.maxHp *
                100
            ) + "%";

        document.getElementById(
            "energy1"
        ).style.width =
            (
                player.energy /
                120 *
                100
            ) + "%";

        document.getElementById(
            "energy2"
        ).style.width =
            (
                enemy.energy /
                120 *
                100
            ) + "%";

        document.getElementById(
            "round"
        ).textContent =
            `${round}/3`;

        /*
            cooldown UI
        */

        document
            .querySelectorAll(
                ".skill"
            )
            .forEach(
                (button, index) => {

                    const cd =
                        player.cooldowns[
                            index
                        ];

                    const text =
                        button.querySelector(
                            ".cooldown"
                        );

                    if (cd > 0) {

                        button.classList.add(
                            "disabled"
                        );

                        text.textContent =
                            Math.ceil(
                                cd / 1000
                            );

                    } else {

                        button.classList.remove(
                            "disabled"
                        );

                        text.textContent =
                            "";
                    }
                }
            );

        requestAnimationFrame(
            gameLoop
        );
    }

    /* =========================
       KEYBOARD
    ========================= */

    window.addEventListener(
        "keydown",
        event => {

            const key =
                event.key.toLowerCase();

            keys[key] = true;

            if (
                ["q", "w", "e", "r"]
                .includes(key)
            ) {

                useSkill(
                    ["q", "w", "e", "r"]
                    .indexOf(key)
                );
            }
        }
    );

    window.addEventListener(
        "keyup",
        event => {

            keys[
                event.key.toLowerCase()
            ] = false;
        }
    );

    /* =========================
       BLOCK
    ========================= */

    const block =
        document.getElementById(
            "block"
        );

    block.onpointerdown = () => {

        player.blocking = true;
    };

    block.onpointerup = () => {

        player.blocking = false;
    };

    block.onpointercancel = () => {

        player.blocking = false;
    };

    /* =========================
       JOYSTICK
    ========================= */

    const joystick =
        document.getElementById(
            "joystick"
        );

    const knob =
        document.getElementById(
            "joystickKnob"
        );

    let joystickActive =
        false;

    joystick.onpointerdown =
        event => {

            joystickActive = true;

            joystick.setPointerCapture(
                event.pointerId
            );
        };

    joystick.onpointermove =
        event => {

            if (
                !joystickActive
            ) {
                return;
            }

            const rect =
                joystick.getBoundingClientRect();

            const dx =
                Math.max(
                    -30,
                    Math.min(
                        30,
                        event.clientX -
                        rect.left -
                        41
                    )
                );

            knob.style.transform =
                `translateX(${dx}px)`;

            keys.left =
                dx < -8;

            keys.right =
                dx > 8;
        };

    joystick.onpointerup =
        () => {

            joystickActive = false;

            knob.style.transform =
                "";

            keys.left = false;

            keys.right = false;
        };

    /*
        Старт.
    */

    requestAnimationFrame(
        gameLoop
    );
}
