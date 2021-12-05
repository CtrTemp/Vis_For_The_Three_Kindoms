
let during = 1000;


function render(matrix, search_map_opp){

    var svg = d3.select("svg"), // ��ȡsvgԪ��
    width = +svg.attr("width"), // ��ȡsvgԪ�صĿ���
    height = +svg.attr("height"), //   ��ȡsvgԪ�صĸ߶�
    // ������뾶�ߴ磬����ȡsvg�����Ŀ����ߵ���Сֵ��һ�룬��ȥ40����ʾ����������أ�
    outerRadius = Math.min(width, height) * 0.5 - 40,
    // �����ڰ뾶�ߴ�
    innerRadius = outerRadius*0.9;


    // ����һ��chord diagram�Ĳ��ֺ���chord()����ͨ��chord()������matrixת����matrixʵ�ʷֳ���
    // �������֣�groups �� chords ,
    // ����groups��ʾ��ͼ�ϵĻ�����Ϊ���ң�groups�еĸ���Ԫ�ض�����������������angle��startAngle��endAngle��index��value���ֶΣ�
    // chords ��Ϊ���ң���ʾ��ͼ�нڵ�����߼���Ȩ�ء�chords �����Ϊ source �� target ���ֱ��ʶ���ߵ����ˡ�
    var chord = d3.chord()
        // ������Ƭ��֮��ļ���Ƕȣ���chord diagram ͼ��������ԲȦ�ĸ�������֮��ĽǶ�
        .padAngle(0.05)
        // �������ݾ���matrix �����ڸ��е�����˳��Ϊ��������
        .sortSubgroups(d3.descending);

    // ����һ�����ߵĲ��ֺ���arc()
    var arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius);

    // ����һ���Ҳ��ֺ���ribbon()
    var ribbon = d3.ribbon()
        .radius(innerRadius);

    // ��ɫ������
    var color = d3.scaleOrdinal()
        .domain(d3.range(4))
        .range(d3.schemeCategory10);


    // ����һ����Ԫ��
    var g = svg.select(".mainG")
        .datum(chord(matrix));



    // ��Բ��������Χ��һȦͼԪ���������ǽڵ�Ԫ��
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

    
    

    // ���ң��ڲ���Բ�����ӣ������������ӽڵ�ı�

    var edge_group = g.select(".ribbons_path")
        .selectAll("path")
        .data(chords=>chords).join("path")
        .transition().duration(during)
        .attr("d", ribbon)
        .attr("fill", d=>color(d.target.index))
        .attr("stroke", "black")
        .attr("stroke-width", '1')
        .attr("opacity", 0.5);
        


    
    //�������֣��������������ӣ������ڵ���
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
    let search_map = [];//�����Ӧmatrix������������ұ���������ң����ֲ�������
    let search_map_opp = [];//�����϶�Ӧ�ķ�����ұ�������������
        
    
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
                    if(raw_nodes[i].name1==raw_links[j].node1)//�ҵ�һ��ƥ��link��
                    {
                        //�ҵ�֮��������������֪��node2��Ӧ��������������е�λ��
                        ori_matrix[i][search_map[raw_links[j].node2]] = Number(raw_links[j].link_num);
                        void_flag = void_flag+Number(raw_links[j].link_num);
                    }
                    if(raw_nodes[i].name1==raw_links[j].node2)
                    {
                        ori_matrix[i][search_map[raw_links[j].node1]] = Number(raw_links[j].link_num);
                        void_flag = void_flag+Number(raw_links[j].link_num);
                    }

                }
                if(void_flag==0)//˵������������ˣ�����û�����������ｨ�����ӣ���ô�����������Լ���������
                {
                    ori_matrix[i][i] = 1;
                }

            }
            render(ori_matrix, search_map_opp);
            
        })
        //����Ϊֹ�������Ѿ��õ�����Ҫ��matrix
        //��ע�⣬һ��Ҫ������������ڽ�����Ⱦ�����ݺ����޷�����������䣬�����ڽ������ɵ㣿��
    })
}


function render_first(){
    let raw_nodes = [];
    let raw_links = [];
    let search_map = [];//�����Ӧmatrix������������ұ���������ң����ֲ�������
    let search_map_opp = [];//�����϶�Ӧ�ķ�����ұ�������������
        
    
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
                    if(raw_nodes[i].name1==raw_links[j].node1)//�ҵ�һ��ƥ��link��
                    {
                        //�ҵ�֮��������������֪��node2��Ӧ��������������е�λ��
                        ori_matrix[i][search_map[raw_links[j].node2]] = Number(raw_links[j].link_num);
                        void_flag = void_flag+Number(raw_links[j].link_num);
                    }
                    if(raw_nodes[i].name1==raw_links[j].node2)
                    {
                        ori_matrix[i][search_map[raw_links[j].node1]] = Number(raw_links[j].link_num);
                        void_flag = void_flag+Number(raw_links[j].link_num);
                    }

                }
                if(void_flag==0)//˵������������ˣ�����û�����������ｨ�����ӣ���ô�����������Լ���������
                {
                    ori_matrix[i][i] = 1;
                }

            }


            var svg = d3.select("svg"), // ��ȡsvgԪ��
            width = +svg.attr("width"), // ��ȡsvgԪ�صĿ���
            height = +svg.attr("height"), //   ��ȡsvgԪ�صĸ߶�
            // ������뾶�ߴ磬����ȡsvg�����Ŀ����ߵ���Сֵ��һ�룬��ȥ40����ʾ����������أ�
            outerRadius = Math.min(width, height) * 0.5 - 40,
            // �����ڰ뾶�ߴ�
            innerRadius = outerRadius*0.9;

        
            // ����һ��chord diagram�Ĳ��ֺ���chord()����ͨ��chord()������matrixת����matrixʵ�ʷֳ���
            // �������֣�groups �� chords ,
            // ����groups��ʾ��ͼ�ϵĻ�����Ϊ���ң�groups�еĸ���Ԫ�ض�����������������angle��startAngle��endAngle��index��value���ֶΣ�
            // chords ��Ϊ���ң���ʾ��ͼ�нڵ�����߼���Ȩ�ء�chords �����Ϊ source �� target ���ֱ��ʶ���ߵ����ˡ�
            var chord = d3.chord()
                // ������Ƭ��֮��ļ���Ƕȣ���chord diagram ͼ��������ԲȦ�ĸ�������֮��ĽǶ�
                .padAngle(0.05)
                // �������ݾ���matrix �����ڸ��е�����˳��Ϊ��������
                .sortSubgroups(d3.descending);

            // ����һ�����ߵĲ��ֺ���arc()
            var arc = d3.arc()
                .innerRadius(innerRadius)
                .outerRadius(outerRadius);

            // ����һ���Ҳ��ֺ���ribbon()
            var ribbon = d3.ribbon()
                .radius(innerRadius);

            // ��ɫ������
            var color = d3.scaleOrdinal()
                .domain(d3.range(4))
                .range(d3.schemeCategory10);

            var g = svg.append("g")
            .attr("class", "mainG")
            .attr("transform", `translate(${width/2},${height/2})`)
            .datum(chord(ori_matrix));

            
            // ��Բ��������Χ��һȦͼԪ���������ǽڵ�Ԫ��
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


            //���ң��ڲ���Բ�����ӣ������������ӽڵ�ı�

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



            //�������֣��������������ӣ������ڵ���
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
        //����Ϊֹ�������Ѿ��õ�����Ҫ��matrix
        //��ע�⣬һ��Ҫ������������ڽ�����Ⱦ�����ݺ����޷�����������䣬�����ڽ������ɵ㣿��
    })
}