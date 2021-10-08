(function() {
    let mods = {
        packs: {
            "Hide rules":{
                turnOn: function(){
                    mods.getLeftPanel(/Collision Rules/).hide();
                },
                turnOff: function(){
                    mods.getLeftPanel(/Collision Rules/).show();
                }
            },
            "HP & Boost Mod":{
                turnOn: function(){
                    socket.on("p", this.updateNicknames);
                },
                turnOff: function(){
                    socket.off("p", this.updateNicknames);
                },
                boost_values: [35, 47, 63, 84, 112, 150, 200, 267, 356, 475, 633, 844, 1126, 1501, 2002, 2669, 3559, 4746, 6328, 8437],
                updateNicknames: function(){
                    let ids = Object.keys(game_state.players);
                    for (let i of ids) {
                        let p = game_state.players[i];
                        let boosts = mods.packs["HP & Boost Mod"].boost_values.indexOf(Math.max.apply(Math, mods.packs["HP & Boost Mod"].boost_values.filter(function (x) { return x <= p.HP }))) + 1;
                        p.username = `${p.username} ${Math.round(p.HP)} [${boosts}]`;
                    }
                }
            },
            "Boost counter":{
                init: function(){
                    $("#game-parent").append(`<p id="boost-mod" style="position: absolute; color: white; top: 10px; left: 10px; border: 2px dashed white; padding: 10px;">Used boost: <span id="boost-counter">0</span><button type="button" class="btn btn-light" style="margin-left: 10px;" onclick="$('#boost-counter').text('0')">Reset counter</button></p>`);
                    $("#boost-mod").hide();
                },
                turnOn: function(){
                    $("#game-parent canvas").on("click", this.incrementCounter);
                    $("#boost-mod").show();
                },
                turnOff: function(){
                    $("#game-parent canvas").off("click", this.incrementCounter);
                    $("#boost-mod").hide();
                },
                incrementCounter: function(){
                    $("#boost-counter").text(parseInt($("#boost-counter").text())+1);
                }
            },
            "White boxes counter":{
                init: function(){
                    $("#game-parent").append(`<p id="white-mod" style="position: absolute; color: white; top: 10px; right: 10px;"><span id="white-counter">0</span> ⬜</p>`);
                    $("#white-mod").hide();
                },
                turnOn: function(){
                    socket.on("box", this.incrementCounter);
                    socket.on("game_started", this.resetCounter);
                    $("#white-mod").show();
                },
                turnOff: function(){
                    socket.off("box", this.incrementCounter);
                    socket.off("game_started", this.resetCounter);
                    $("#white-mod").hide();
                },
                incrementCounter: function(){
                    setTimeout(()=>{
                        let boxes = Object.keys(user_state.cloud.loot);
                        if(user_state.cloud.loot[boxes[boxes.length-1]][0]==""){
                            $("#white-counter").text(parseInt($("#white-counter").text())+1);
                        }
                    },50);
                },
                resetCounter: function(){
                    $("#white-counter").text("0");
                }
            },
            "Boxes calculator":{
                init: function(){
                    mods.packs["Boxes calculator"].boxPanelTitle = mods.getLeftPanel(/Last player alive wins/).find("h4.sub-title").first();
                    mods.packs["Boxes calculator"].boxesElement = mods.getLeftPanel(/Last player alive wins/).find("div.smooth-div div div div").first();
                },
                turnOn: function(){
                    this.calculateValue();
                    socket.on("box", this.calculateValue);
                    mods.packs["Boxes calculator"].boxesElement.on("click", "div.prevent-boost.cardList.list-complete-item", this.calculateValue);
                },
                turnOff: function(){
                    socket.off("box", this.calculateValue);
                    mods.packs["Boxes calculator"].boxesElement.off("click", "div.prevent-boost.cardList.list-complete-item", this.calculateValue);
                    mods.packs["Boxes calculator"].boxPanelTitle.text("Last player alive wins");
                },
                calculateValue: function(){
                    setTimeout(()=>{
                        let boxes = Object.values(user_state.cloud.loot);
                        let sum = 0;
                        for(let b of boxes) sum+=(b[1]/b[2])/100;
                        mods.packs["Boxes calculator"].boxPanelTitle.text(`Boxes value: ${parseFloat(sum).toFixed(3)} ROY`);
                    },50);
                }
            },
            "Recording":{
                init: function(){
                    mods.packs["Recording"].canvas = document.querySelector("#game-parent canvas");
                },
                turnOn: function(){
                    const chunks = []; // here we will store our recorded media chunks (Blobs)
                    const stream = mods.packs["Recording"].canvas.captureStream(); // grab our canvas MediaStream
                    mods.packs["Recording"].rec = new MediaRecorder(stream); // init the recorder
                    // every time the recorder has new data, we will store it in our array
                    mods.packs["Recording"].rec.ondataavailable = e => chunks.push(e.data);
                    // only when the recorder stops, we construct a complete Blob from all the chunks
                    mods.packs["Recording"].rec.onstop = e => mods.packs["Recording"].exportVid(new Blob(chunks, {type: 'video/webm'}));
                    mods.packs["Recording"].rec.start();
                },
                turnOff: function(){
                    mods.packs["Recording"].rec.stop();
                },
                exportVid: function(blob){
                    const vid = document.createElement('video');
                    vid.src = URL.createObjectURL(blob);
                    vid.controls = true;
                    window.open(vid.src);
                }

            }
        },
        settings: {},
        htmlPanel: `<li class="timeline fade-when-gaming" data-v-ff11dc46="" style="opacity: 1;"><h4 data-v-ff11dc46=""> Mods  <a data-v-ff11dc46=""><i class="prevent-boost fas fa-hammer fa-sm" data-v-ff11dc46=""></i></a></h4><p data-v-ff11dc46="">Click the hammer to expand.<br data-v-ff11dc46="">Made by ROY_TO_THE_MOON</p><div style="display: flex; flex-direction: column; align-items: flex-end; margin-top: 10px; margin-bottom: 40px;" class="prevent-boost" data-v-ff11dc46=""></div></li>`,
        htmlOption: function(name){
            return `<div style="margin-top: 5px;"><label style="color: white;"><input type="checkbox">${name}</label></div>`;
        },
        getLeftPanel: function(innerRegExp){
            return $("ul[data-v-ff11dc46]").find("li").filter(function () {return innerRegExp.test(this.innerHTML);});
        },
        init: function(){
            this.getLeftPanel(/Boxes provide health/).remove();
            this.getLeftPanel(/Collision Rules/).after(this.htmlPanel);
            this.hammerIcon = this.getLeftPanel(/Mods/).find("i.fa-hammer");
            this.descriptionElement = this.getLeftPanel(/Mods/).find("p");
            this.optionsElement = this.getLeftPanel(/Mods/).find("div");
            for(const p in this.packs){
                this.settings[p]=false;
                this.optionsElement.append(this.htmlOption(p));
            }
            this.optionsElement.hide();
            this.hammerIcon.on("click", function(){
                mods.descriptionElement.toggle();
                mods.optionsElement.toggle();
            });
            this.optionsElement.find("input[type='checkbox']").on("change", function(){
                let modName = $(this).parent().text();
                mods.settings[modName] = this.checked;
                if(this.checked) {
                    mods.packs[modName].turnOn();
                } else {
                    mods.packs[modName].turnOff();
                }
            });
            this.initAllMods();
        },
        initAllMods: function(){
            $("#game-parent").css("position","relative");
            for(const p in this.packs){
                if(this.packs[p].hasOwnProperty("init")){
                    this.packs[p].init();
                }
            }
        }
    };
    mods.init();
})();