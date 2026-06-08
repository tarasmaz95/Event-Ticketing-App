import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme';

interface QrCodeProps {
  value: string;
  size?: number;
}

function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function finderPattern(): boolean[][] {
  const size = 7;
  const grid: boolean[][] = [];
  for (let r = 0; r < size; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < size; c++) {
      const outer = r === 0 || r === 6 || c === 0 || c === 6;
      const inner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
      row.push(outer || inner);
    }
    grid.push(row);
  }
  return grid;
}

export function QrCode({ value, size = 240 }: QrCodeProps) {
  const matrix = useMemo(() => {
    const dim = 29;
    const seed = hashSeed(value);
    const grid: boolean[][] = Array.from({ length: dim }, () =>
      Array.from({ length: dim }, () => false)
    );

    const placeFinder = (startR: number, startC: number) => {
      const pattern = finderPattern();
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          grid[startR + r][startC + c] = pattern[r][c];
        }
      }
    };

    placeFinder(0, 0);
    placeFinder(0, dim - 7);
    placeFinder(dim - 7, 0);

    for (let r = 0; r < dim; r++) {
      for (let c = 0; c < dim; c++) {
        const inTopLeft = r < 8 && c < 8;
        const inTopRight = r < 8 && c >= dim - 8;
        const inBottomLeft = r >= dim - 8 && c < 8;
        const inCenter = r >= 10 && r <= 18 && c >= 9 && c <= 19;
        if (inTopLeft || inTopRight || inBottomLeft || inCenter) continue;
        const v = (seed + r * 131 + c * 17) * 2654435761;
        grid[r][c] = ((v >>> ((r + c) % 13)) & 1) === 1;
      }
    }

    return grid;
  }, [value]);

  const cellSize = size / matrix.length;

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      {matrix.map((row, r) => (
        <View key={`r-${r}`} style={styles.row}>
          {row.map((on, c) => (
            <View
              key={`c-${r}-${c}`}
              style={[
                styles.cell,
                {
                  width: cellSize,
                  height: cellSize,
                  backgroundColor: on ? '#111' : '#fff',
                },
              ]}
            />
          ))}
        </View>
      ))}
      <View style={styles.brandOverlay} pointerEvents="none">
        <View style={styles.brandBadge}>
          <Text style={styles.brandText}>Your Brand</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {},
  brandOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandBadge: {
    backgroundColor: Colors.red,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 3,
    minWidth: 104,
    alignItems: 'center',
  },
  brandText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
});
