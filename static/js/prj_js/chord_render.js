
let during = 1000;


function render(matrix, search_map_opp){

    var svg = d3.select("svg"), // 获取svg元素
    width = +svg.attr("width"), // 获取svg元素的宽度
    height = +svg.attr("height"), //   获取svg元素的高度
    // 计算外半径尺寸，这里取svg画布的宽、高的最小值的一半，减去40，表示两边留有余地；
    outerRadius = Math.min(width, height) * 0.5 - 40,
    // 计算内半径尺寸
    innerRadius = outerRadius*0.9;


    // 定义一个chord diagram的布局函数chord()由于通过chord()函数将matrix转换后，matrix实际分成了
    // 两个部分，groups 和 chords ,
    // 其中groups表示弦图上的弧，称为外弦，groups中的各个元素都被计算用添加上了angle、startAngle、endAngle、index、value等字段；
    // chords 称为内弦，表示弦图中节点的连线及其权重。chords 里面分为 source 和 target ，分别标识连线的两端。
    var chord = d3.chord()
        // 设置弦片段之间的间隔角度，即chord diagram 图中组成外层圆圈的各个弧段之间的角度
        .padAngle(0.05)
        // 设置数据矩阵matrix 的行内各列的排序顺序为降序排列
        .sortSubgroups(d3.descending);

    // 定义一个弧线的布局函数arc()
    var arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius);

    // 定义一个弦布局函数ribbon()
    var ribbon = d3.ribbon()
        .radius(innerRadius);

    // 颜色比例尺
    var color = d3.scaleOrdinal()
        .domain(d3.range(4))
        .range(d3.schemeCategory10);


    // 定义一个组元素
    var g = svg.select(".mainG")
        .datum(chord(matrix));



    // 画圆弧，最外围的一圈图元，代表的是节点元素
    var arc_group = g.select(".circle_path")
        .selectAll("path")
        .data(chords=>chords.groups)
        .join("path")
        .transition().duration(during)

        .attr("fill", d=>color(d.index))
        .attr("stroke", "black")
        .attr("stroke-width", '1')
        .attr("d", arc)
        .attr("opacity", 0.8);

    
    

    // 画弦，内部的圆弧链接，代表的是链接节点的边

    var edge_group = g.select(".ribbons_path")
        .selectAll("path")
        .data(chords=>chords).join("path")
        .transition().duration(during)
        .attr("d", ribbon)
        .attr("fill", d=>color(d.target.index))
        .attr("stroke", "black")
        .attr("stroke-width", '1')
        .attr("opacity", 0.5);
        


    
    //添加文字（文字最后绘制添加，减少遮挡）
    var text_group = g.select(".text_groups")
    .selectAll("text")
    .data(chords=>chords.groups).join('text')
    .transition().duration(during)
        .attr("fill", "black")
        .attr("stroke", "black")
        .attr("stroke-width", '1')
        .attr('transform', d=>{
            let x_move;
            let y_move;
            x_move = (20+outerRadius)*Math.cos((d.startAngle+d.endAngle)/2-Math.PI/2);
            y_move = (20+outerRadius)*Math.sin((d.startAngle+d.endAngle)/2-Math.PI/2);
            /*rotate(${-90 + trans_angle}) rotate(${trans_angle>180?180:0})*/
        return ` translate(${x_move}, ${y_move})`
        })
        .text(function(data){
            return search_map_opp[data.index];
        })//
        .attr('font-size', '2em')
}





function readFileAndRender(path_node,path_link){

    let raw_nodes = [];
    let raw_links = [];
    let search_map = [];//人物对应matrix的行列坐标查找表（正向查找：名字查索引）
    let search_map_opp = [];//与以上对应的反向查找表：索引查名字
        
    
    d3.csv(path_node).then(node=>{
        raw_nodes = node;
        let ori_matrix = new Array()
        for(i=0;i<raw_nodes.length;i++)
        {
            search_map[raw_nodes[i].name1] = i;
            search_map_opp[i] = raw_nodes[i].name1;
        }
        
        
        for(i=0;i<raw_nodes.length;i++)
        {
            ori_matrix[i] = new Array();
            for(j=0;j<raw_nodes.length;j++)
            {
                ori_matrix[i][j] = 0;
            }
        }
        
        //console.log(ori_matrix);
        d3.csv(path_link).then(link=>{
            raw_links = link;
            for(i=0;i<raw_nodes.length;i++)
            {
                let void_flag = 0;
                for(j=0;j<raw_links.length;j++)
                {
                    if(raw_nodes[i].name1==raw_links[j].node1)//找到一个匹配link点
                    {
                        //找到之后我们想做的是知道node2对应的人物在人物表中的位置
                        ori_matrix[i][search_map[raw_links[j].node2]] = Number(raw_links[j].link_num);
                        void_flag = void_flag+Number(raw_links[j].link_num);
                    }
                    if(raw_nodes[i].name1==raw_links[j].node2)
                    {
                        ori_matrix[i][search_map[raw_links[j].node1]] = Number(raw_links[j].link_num);
                        void_flag = void_flag+Number(raw_links[j].link_num);
                    }

                }
                if(void_flag==0)//说明该人物出现了，但是没有与其他人物建立链接，那么我们让他和自己建立链接
                {
                    ori_matrix[i][i] = 1;
                }

            }
            render(ori_matrix, search_map_opp);
            
        })
        //至此为止，我们已经得到了想要的matrix
        //但注意，一定要在上面的括号内进行渲染，数据好像无法传出以上语句，现在在解决这个疑点？！
    })
}


function render_first(){
    let raw_nodes = [];
    let raw_links = [];
    let search_map = [];//人物对应matrix的行列坐标查找表（正向查找：名字查索引）
    let search_map_opp = [];//与以上对应的反向查找表：索引查名字
        
    
    d3.csv("./static/data/node_1.csv").then(node=>{
        raw_nodes = node;
        let ori_matrix = new Array()
        for(i=0;i<raw_nodes.length;i++)
        {
            search_map[raw_nodes[i].name1] = i;
            search_map_opp[i] = raw_nodes[i].name1;
        }
        
        
        for(i=0;i<raw_nodes.length;i++)
        {
            ori_matrix[i] = new Array();
            for(j=0;j<raw_nodes.length;j++)
            {
                ori_matrix[i][j] = 0;
            }
        }
        
        //console.log(ori_matrix);
        d3.csv("./static/data/links_1.csv").then(link=>{
            raw_links = link;
            for(i=0;i<raw_nodes.length;i++)
            {
                let void_flag = 0;
                for(j=0;j<raw_links.length;j++)
                {
                    if(raw_nodes[i].name1==raw_links[j].node1)//找到一个匹配link点
                    {
                        //找到之后我们想做的是知道node2对应的人物在人物表中的位置
                        ori_matrix[i][search_map[raw_links[j].node2]] = Number(raw_links[j].link_num);
                        void_flag = void_flag+Number(raw_links[j].link_num);
                    }
                    if(raw_nodes[i].name1==raw_links[j].node2)
                    {
                        ori_matrix[i][search_map[raw_links[j].node1]] = Number(raw_links[j].link_num);
                        void_flag = void_flag+Number(raw_links[j].link_num);
                    }

                }
                if(void_flag==0)//说明该人物出现了，但是没有与其他人物建立链接，那么我们让他和自己建立链接
                {
                    ori_matrix[i][i] = 1;
                }

            }


            var svg = d3.select("svg"), // 获取svg元素
            width = +svg.attr("width"), // 获取svg元素的宽度
            height = +svg.attr("height"), //   获取svg元素的高度
            // 计算外半径尺寸，这里取svg画布的宽、高的最小值的一半，减去40，表示两边留有余地；
            outerRadius = Math.min(width, height) * 0.5 - 40,
            // 计算内半径尺寸
            innerRadius = outerRadius*0.9;

        
            // 定义一个chord diagram的布局函数chord()由于通过chord()函数将matrix转换后，matrix实际分成了
            // 两个部分，groups 和 chords ,
            // 其中groups表示弦图上的弧，称为外弦，groups中的各个元素都被计算用添加上了angle、startAngle、endAngle、index、value等字段；
            // chords 称为内弦，表示弦图中节点的连线及其权重。chords 里面分为 source 和 target ，分别标识连线的两端。
            var chord = d3.chord()
                // 设置弦片段之间的间隔角度，即chord diagram 图中组成外层圆圈的各个弧段之间的角度
                .padAngle(0.05)
                // 设置数据矩阵matrix 的行内各列的排序顺序为降序排列
                .sortSubgroups(d3.descending);

            // 定义一个弧线的布局函数arc()
            var arc = d3.arc()
                .innerRadius(innerRadius)
                .outerRadius(outerRadius);

            // 定义一个弦布局函数ribbon()
            var ribbon = d3.ribbon()
                .radius(innerRadius);

            // 颜色比例尺
            var color = d3.scaleOrdinal()
                .domain(d3.range(4))
                .range(d3.schemeCategory10);

            var g = svg.append("g")
            .attr("class", "mainG")
            .attr("transform", `translate(${width/2},${height/2})`)
            .datum(chord(ori_matrix));

            
            // 画圆弧，最外围的一圈图元，代表的是节点元素
            var arc_group = g.append("g")
            .attr("class", "circle_path")
            .selectAll("circle_path")
            .data(chords=>chords.groups).join("path");

            arc_group
                .attr("fill", d=>color(d.index))
                .attr("stroke", "black")
                .attr("stroke-width", '2')
                .attr("d", arc)
                .attr("opacity", 0.8);
                //.transition().duration(1000);


            //画弦，内部的圆弧链接，代表的是链接节点的边

            var edge_group = g.append("g")
                .attr("class", "ribbons_path")
                .selectAll("ribbons_path")
                .data(chords=>chords).join("path");

            edge_group
                .attr("fill", d=>color(d.target.index))
                .attr("stroke", "black")
                .attr("stroke-width", '2')
                .attr("d", ribbon)
                .attr("opacity", 0.5);
                //.transition().duration(1000);



            //添加文字（文字最后绘制添加，减少遮挡）
            var text_group = g.append("g")
            .attr("class", "text_groups")
            .selectAll("text_groups")
            .data(chords=>chords.groups).join('text')


            text_group
                .attr("fill", "black")
                .attr("stroke", "black")
                .attr("stroke-width", '1')
                .attr('transform', d=>{
                    let x_move;
                    let y_move;
                    x_move = (20+outerRadius)*Math.cos((d.startAngle+d.endAngle)/2-Math.PI/2);
                    y_move = (20+outerRadius)*Math.sin((d.startAngle+d.endAngle)/2-Math.PI/2);
                    /*rotate(${-90 + trans_angle}) rotate(${trans_angle>180?180:0})*/
                return ` translate(${x_move}, ${y_move})`
                })
                .text(function(data){
                    return search_map_opp[data.index];
                })//
                .attr('font-size', '2em');
                //.transition().duration(1000);
        })
        //至此为止，我们已经得到了想要的matrix
        //但注意，一定要在上面的括号内进行渲染，数据好像无法传出以上语句，现在在解决这个疑点？！
    })
}