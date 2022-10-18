import React, {ReactNode, useCallback, useMemo, useRef, useState} from 'react';
import {Dimensions, Pressable, SafeAreaView, Text, View} from 'react-native';
import {
  DataProvider,
  LayoutProvider,
  ProgressiveListView,
} from 'recyclerlistview';
import {generateItems} from './generateItems';

enum ViewTypes {
  GREY = 'grey',
  WHITE = 'white',
}

const {width} = Dimensions.get('window');

const layoutProvider = new LayoutProvider(
  index => (index % 2 ? ViewTypes.GREY : ViewTypes.WHITE),
  (_, dim) => {
    // this part is ignored when forceNonDeterministicRendering is true
    dim.height = 100;
    dim.width = width;
  },
);

let counter = 0;

const CellContainer = ({
  type,
  children,
  onPress,
}: {
  type: 'grey' | 'white';
  children: ReactNode;
  onPress: () => void;
}) => {
  const count = useRef(counter++);

  return (
    <Pressable
      style={{
        flex: 1,
      }}
      onPress={onPress}>
      <View
        style={{
          backgroundColor: type,
        }}>
        <Text>{count.current}</Text>
        {children}
      </View>
    </Pressable>
  );
};

const provider = new DataProvider((r1, r2) => {
  return r1 !== r2;
});

const Recycler = () => {
  const [items, setItems] = useState(generateItems(10));

  const dataProvider = useMemo(() => {
    return provider.cloneWithRows(items);
  }, [items]);

  // (item: Item, index: number) => ReactNode
  const rowRender = useCallback((viewTypes: string | number, data: number) => {
    const onPress = () => {
      setItems(list => list.filter(i => i !== data));
    };

    switch (viewTypes) {
      case ViewTypes.GREY:
        return (
          <CellContainer type="grey" onPress={onPress}>
            <Text>Data: {data}</Text>
          </CellContainer>
        );
      case ViewTypes.WHITE:
        return (
          <View style={{backgroundColor: 'red', marginVertical: 20}}>
            <Text>Data: {data}</Text>
          </View>
        );
      default:
        return null;
    }
  }, []);

  return (
    <SafeAreaView
      style={{
        flex: 1,
      }}>
      <ProgressiveListView
        layoutProvider={layoutProvider}
        dataProvider={dataProvider}
        renderItemContainer={(props, parentProps, children) => {
          return (
            <View
              {...parentProps}
              style={{
                backgroundColor: 'orange',
              }}>
              <Text>Hello</Text>
              {children}
            </View>
          );
        }}
        rowRenderer={rowRender}
      />
    </SafeAreaView>
  );
};
