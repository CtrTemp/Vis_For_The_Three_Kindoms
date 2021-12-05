function Scrubber(values, {
    format = value => value,
    initial = 1,
    delay = null,
    autoplay = true,
    loop = true,
    loopDelay = null,
    alternate = false
    } = {}) {
    values = Array.from(values);
    const button_node = document.createElement('button');
    button_node.setAttribute('name', 'b');
    button_node.setAttribute('type', 'button');
    button_node.setAttribute('style', 'margin-right: 0.4em; width: 5em;');


    

    const input_node = document.createElement('input');
    input_node.setAttribute('name','i');
    input_node.setAttribute('type','range');
    input_node.setAttribute('min', 0);
    input_node.setAttribute('max', `${values.length - 1}`);//
    input_node.setAttribute('value', `${initial}`);//
    input_node.setAttribute('step',1);
    input_node.setAttribute('style',"width: 180px;");

    const output_node = document.createElement('output');
    output_node.setAttribute('name','o');
    output_node.setAttribute('style',"margin-left: 0.4em;");

    const label_node = document.createElement('label');
    label_node.setAttribute('style', 'display: flex; align-items: center;');
    label_node.appendChild(input_node);
    label_node.appendChild(output_node);

    
    

    const form_node = document.createElement('form');
    form_node.setAttribute('style', 'font: 12px var(--sans-serif); font-variant-numeric: tabular-nums; display: flex; height: 33px; align-items: center;');
    form_node.appendChild(button_node);
    form_node.appendChild(label_node);

    const div_node = document.createElement('div');
    div_node.appendChild(form_node);

    

    const body_node = document.getElementsByTagName('body')[0];
    body_node.appendChild(div_node);

    const form = document.getElementsByTagName('form')[0];

    console.log(form);

    //以上基本节点创建过程结束

    let frame = null;
    let timer = null;
    let interval = null;
    let direction = 1;
    function start() {
        form.b.textContent = "Pause";
        if (delay === null) frame = requestAnimationFrame(tick);
        else interval = setInterval(tick, delay);
    }
    function stop() {
        form.b.textContent = "Play";
        if (frame !== null) cancelAnimationFrame(frame), frame = null;
        if (timer !== null) clearTimeout(timer), timer = null;
        if (interval !== null) clearInterval(interval), interval = null;
    }
    function running() {
        return frame !== null || timer !== null || interval !== null;
    }
    function tick() {
        if (form.i.valueAsNumber === (direction > 0 ? values.length - 1 : direction < 0 ? 0 : NaN)) {
        if (!loop) return stop();
        if (alternate) direction = -direction;
        if (loopDelay !== null) {
            if (frame !== null) cancelAnimationFrame(frame), frame = null;
            if (interval !== null) clearInterval(interval), interval = null;
            timer = setTimeout(() => (step(), start()), loopDelay);
            return;
        }
        }
        if (delay === null) frame = requestAnimationFrame(tick);
        step();
    }
    function step() {
        form.i.valueAsNumber = (form.i.valueAsNumber + direction + values.length) % values.length;
        form.i.dispatchEvent(new CustomEvent("input", {bubbles: true}));
    }
    form.i.oninput = event => {
        if (event && event.isTrusted && running()) stop();
        form.value = values[form.i.valueAsNumber];
        form.o.value = format(form.value, form.i.valueAsNumber, values);
    };
    form.b.onclick = () => {
        if (running()) return stop();
        direction = alternate && form.i.valueAsNumber === values.length - 1 ? -1 : 1;
        form.i.valueAsNumber = (form.i.valueAsNumber + direction) % values.length;
        form.i.dispatchEvent(new CustomEvent("input", {bubbles: true}));
        start();
    };
    form.i.oninput();
    if (autoplay) start();
    else stop();
    //Inputs.disposal(form).then(stop);
    //上面这句话目前被注释掉是没有影响的，Inputs未被定义报错，原因不明；这句话的作用不明
    return form;

}


function data_return(){
    let scrubber = document.getElementsByTagName("form")[0];
    return scrubber.o;
}


