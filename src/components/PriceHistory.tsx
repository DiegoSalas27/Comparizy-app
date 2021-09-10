import React, {useEffect} from 'react';
import {Dimensions, StyleSheet, Text, View} from 'react-native';
import {VictoryLine, VictoryChart, VictoryTheme, VictoryScatter} from 'victory-native';
import {IPriceHistory} from '../interfaces/product';
import {formatNumber} from '../utils/formatter';

const screenWidth = Dimensions.get('screen').width;
var maxPrice = 0;
var minPrice = 0;

interface PriceHistoryProps {
  priceHistory: IPriceHistory[];
}

export const PriceHistory: React.FC<PriceHistoryProps> = ({priceHistory}) => {
  useEffect(() => {
    priceHistory.forEach(ph => {
      ph.priceRender = formatNumber(ph.price);
    });
    maxPrice = Math.max.apply(Math, priceHistory.map(function(o) { return o.priceRender; }));
    minPrice = Math.min.apply(Math, priceHistory.map(function(o) { return o.priceRender; }));
  }, [priceHistory]);
  return (
    <View style={styles.container}>
      {priceHistory[priceHistory.length - 1].priceRender && priceHistory.length > 1 && (
        <VictoryChart width={screenWidth * 0.9} theme={VictoryTheme.material} domain={{ y: [minPrice-1000, maxPrice+1000] }}>
          <VictoryLine
            domainPadding={{x: 15}}
            style={{data: { stroke: "#c43a31" },parent: { border: "1px solid #ccc"}}}
            data={priceHistory}
            x="fecha"
            y="priceRender"
          />
        </VictoryChart>
      )}
      {priceHistory[priceHistory.length - 1].priceRender && priceHistory.length == 1 && (
        <VictoryChart width={screenWidth * 0.9} theme={VictoryTheme.material} domain={{ y: [minPrice-1000, maxPrice+1000] }}>
          <VictoryScatter
            domainPadding={{x: 15}}
            style={{ data: { fill: "#c43a31" } }}
            size={3}
            data={priceHistory}
            x="fecha"
            y="priceRender"
          />
        </VictoryChart>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
