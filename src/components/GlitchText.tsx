import React, { useRef, useEffect, useCallback } from "react";
import { Animated, TextStyle, View, StyleSheet } from "react-native";
import { colors } from "../theme";

interface GlitchTextProps {
  children: string;
  style?: TextStyle;
  trigger?: number;
  idleGlitch?: boolean;
  idleIntervalMs?: [number, number];
}

export default function GlitchText({
  children,
  style,
  trigger,
  idleGlitch = false,
  idleIntervalMs = [8000, 12000],
}: GlitchTextProps) {
  const skewX = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const cyanOpacity = useRef(new Animated.Value(0)).current;
  const magentaOpacity = useRef(new Animated.Value(0)).current;
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runGlitch = useCallback(() => {
    const sequence = Animated.sequence([
      // Frame 1: skew left, cyan flash
      Animated.parallel([
        Animated.timing(skewX, { toValue: -5, duration: 0, useNativeDriver: true }),
        Animated.timing(translateX, { toValue: -3, duration: 0, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.8, duration: 0, useNativeDriver: true }),
        Animated.timing(cyanOpacity, { toValue: 1, duration: 0, useNativeDriver: true }),
      ]),
      Animated.delay(80),
      // Frame 2: skew right, magenta flash
      Animated.parallel([
        Animated.timing(skewX, { toValue: 3, duration: 0, useNativeDriver: true }),
        Animated.timing(translateX, { toValue: 4, duration: 0, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 0, useNativeDriver: true }),
        Animated.timing(cyanOpacity, { toValue: 0, duration: 0, useNativeDriver: true }),
        Animated.timing(magentaOpacity, { toValue: 1, duration: 0, useNativeDriver: true }),
      ]),
      Animated.delay(80),
      // Frame 3: settle
      Animated.parallel([
        Animated.timing(skewX, { toValue: -2, duration: 0, useNativeDriver: true }),
        Animated.timing(translateX, { toValue: -1, duration: 0, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.9, duration: 0, useNativeDriver: true }),
        Animated.timing(magentaOpacity, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
      Animated.delay(140),
      // Frame 4: reset
      Animated.parallel([
        Animated.timing(skewX, { toValue: 0, duration: 0, useNativeDriver: true }),
        Animated.timing(translateX, { toValue: 0, duration: 0, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 0, useNativeDriver: true }),
      ]),
    ]);
    sequence.start();
  }, []);

  const runMicroGlitch = useCallback(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(skewX, { toValue: 2, duration: 0, useNativeDriver: true }),
        Animated.timing(translateX, { toValue: -2, duration: 0, useNativeDriver: true }),
      ]),
      Animated.delay(50),
      Animated.parallel([
        Animated.timing(skewX, { toValue: 0, duration: 0, useNativeDriver: true }),
        Animated.timing(translateX, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  // Trigger glitch on prop change
  useEffect(() => {
    if (trigger !== undefined && trigger > 0) {
      runGlitch();
    }
  }, [trigger]);

  // Idle micro-glitch loop
  useEffect(() => {
    if (!idleGlitch) return;

    const scheduleNext = () => {
      const delay =
        idleIntervalMs[0] +
        Math.random() * (idleIntervalMs[1] - idleIntervalMs[0]);
      idleTimer.current = setTimeout(() => {
        runMicroGlitch();
        scheduleNext();
      }, delay);
    };

    scheduleNext();
    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [idleGlitch]);

  return (
    <View style={styles.container}>
      {/* Cyan offset layer */}
      <Animated.Text
        style={[
          style,
          styles.glitchLayer,
          {
            color: colors.glitchCyan,
            opacity: cyanOpacity,
            transform: [{ skewX: "-2deg" }, { translateX: -2 }],
          },
        ]}
      >
        {children}
      </Animated.Text>
      {/* Magenta offset layer */}
      <Animated.Text
        style={[
          style,
          styles.glitchLayer,
          {
            color: colors.glitchMagenta,
            opacity: magentaOpacity,
            transform: [{ skewX: "2deg" }, { translateX: 2 }],
          },
        ]}
      >
        {children}
      </Animated.Text>
      {/* Main text layer */}
      <Animated.Text
        style={[
          style,
          {
            opacity,
            transform: [
              { skewX: skewX.interpolate({ inputRange: [-10, 10], outputRange: ["-10deg", "10deg"] }) },
              { translateX },
            ],
          },
        ]}
      >
        {children}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  glitchLayer: {
    position: "absolute",
    top: 0,
    left: 0,
  },
});
