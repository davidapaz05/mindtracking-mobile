import * as d3 from 'd3';
import { useState } from "react";
import { Text, View } from "react-native";
import { G, Line, Path, Svg, Text as SvgText, Image as SvgImage } from "react-native-svg";
const bolinhaSrc = require("assets/icons/bolinha.png");
import LegendNode from '../../../assets/icons/LegendNode.svg';
import { styles } from "./styles";

type GraficoCardProps = {
  data: number[]            // Passe os dados vindos da sua API aqui!
  color: string 
  title: string
  title2: string
  xLabels: string[]
}

const CHART_ASPECT_RATIO = 0.8;

export function GraficoCard(props: GraficoCardProps) {
  const [width, setWidth] = useState(0);

  const SIDE_PADDING = 18;
  const Y_AXIS_WIDTH = 40;
  const LABEL_GRAPH_PADDING = 26;
  const innerWidth = width - SIDE_PADDING * 2;
  const graphAreaWidth = innerWidth - Y_AXIS_WIDTH;
  const chartWidth = graphAreaWidth;
  const height = width * CHART_ASPECT_RATIO;
  const chartHeight = height - 30;

  // Responsivo: usando props, pronto para API
  const labelsX = props.xLabels.slice(0, 7);
  const data = props.data.slice(0, 7);

  const yTicks = [0, 2, 4, 6, 8, 10];
  const xTicks = labelsX.map((_, idx) => idx);

  const xScale = d3.scaleLinear()
    .domain([0, data.length - 1])
    .range([LABEL_GRAPH_PADDING, chartWidth - LABEL_GRAPH_PADDING]);

  // Responsivo, topo nunca corta/max
  const yScale = d3.scaleLinear().domain([-0.5, 10.5]).range([chartHeight, 0]);

  // *** Para mudar curvatura, altere o valor aqui: ***
  // Ex: .curve(d3.curveCardinal.tension(0.8)) para mais suave, .curve(d3.curveCardinal.tension(0)) para padrão
  const curveTension = 0.3;  // <--- Altere facilmente para o valor desejado!
  const linefn = d3
    .line<number>()
    .y((d) => yScale(d))
    .x((_, i) => xScale(i))
    .curve(d3.curveCardinal.tension(curveTension));

  const areafn = d3
    .area<number>()
    .x((_, i) => xScale(i))
    .y0(chartHeight)
    .y1((d) => yScale(d))
    .curve(d3.curveCardinal.tension(curveTension));

  const svgLine = linefn(data) ?? "";
  const svgArea = areafn(data) ?? "";

  return (
    <View style={styles.card} onLayout={({nativeEvent}) => setWidth(nativeEvent.layout.width)}>
      <View style={styles.header}>
        <Text style={styles.title}>{props.title}</Text>
        <Text style={styles.title2}>{props.title2}</Text>
      </View>
      <View style={{ flexDirection: 'row', marginTop: 6 }}>
        <View style={{
          width: Y_AXIS_WIDTH,
          height: chartHeight,
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          paddingRight: 8,
        }}>
          {yTicks.slice().reverse().map((tick, idx) => (
            <Text 
              key={idx} 
              style={{
                color: '#cbd5e1',
                fontSize: 12,
              }}
            >
              {tick}
            </Text>
          ))}
        </View>
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Svg 
            width={chartWidth}
            height={height} 
            viewBox={`0 0 ${chartWidth} ${chartHeight + 30}`}
          >
            <G>
              {yTicks.map((tick, idx) => (
                <Line
                  key={`h-${idx}`}
                  x1={LABEL_GRAPH_PADDING}
                  y1={yScale(tick)}
                  x2={chartWidth - LABEL_GRAPH_PADDING}
                  y2={yScale(tick)}
                  stroke="#00001A"
                  strokeWidth={1}
                  strokeDasharray={[4, 4]}
                />
              ))}
              {xTicks.map((tick, idx) => (
                <Line
                  key={`v-${idx}`}
                  x1={xScale(tick)}
                  y1={0}
                  x2={xScale(tick)}
                  y2={chartHeight}
                  stroke="#00001A"
                  strokeWidth={1}
                  strokeDasharray={[4, 4]}
                />
              ))}
              <Path d={svgArea} stroke="none" fill={props.color} opacity={0.1} />
              <Path d={svgLine} stroke="blue" fill="none" strokeWidth={2}/>
              {data.map((value, idx) => (
                <SvgImage
                  key={idx}
                  href={bolinhaSrc}
                  x={xScale(idx) - 6.5}
                  y={yScale(value) - 6.5}
                  width={13}
                  height={13}
                  opacity={1}
                  preserveAspectRatio="xMidYMid slice"
                />
              ))}
              {labelsX.map((label, idx) => (
                <SvgText
                  key={idx}
                  x={xScale(idx)}
                  y={chartHeight + 15}
                  fontSize={8}
                  fill="#cbd5e1"
                  textAnchor="middle"
                >
                  {label}
                </SvgText>
              ))}
            </G>
          </Svg>
        </View>
      </View>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
        marginBottom: 2,
      }}>
        <LegendNode width={16} height={16} />
        <Text style={{ color: '#cbd5e1', fontSize: 14, marginLeft: 6 }}>Esta semana</Text>
      </View>
    </View>
  );
}
