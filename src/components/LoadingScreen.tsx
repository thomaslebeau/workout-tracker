import React, { useRef, useEffect, useCallback } from "react";
import { View, Animated, StyleSheet } from "react-native";
import { colors } from "../theme";

const GLITCH_TEXT = "SYSTEM";

export default function LoadingScreen() {
  const skewX = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const mainOpacity = useRef(new Animated.Value(1)).current;
  const cyanOpacity = useRef(new Animated.Value(0)).current;
  const magentaOpacity = useRef(new Animated.Value(0)).current;
  const scanY = useRef(new Animated.Value(0)).current;

  const runGlitchLoop = useCallback(() => {
    const glitchSequence = Animated.sequence([
      // Idle pause
      Animated.delay(800),
      // Frame 1: skew left, cyan
      Animated.parallel([
        Animated.timing(skewX, { toValue: -8, duration: 0, useNativeDriver: true }),
        Animated.timing(translateX, { toValue: -6, duration: 0, useNativeDriver: true }),
        Animated.timing(mainOpacity, { toValue: 0.7, duration: 0, useNativeDriver: true }),
        Animated.timing(cyanOpacity, { toValue: 1, duration: 0, useNativeDriver: true }),
      ]),
      Animated.delay(60),
      // Frame 2: skew right, magenta
      Animated.parallel([
        Animated.timing(skewX, { toValue: 5, duration: 0, useNativeDriver: true }),
        Animated.timing(translateX, { toValue: 8, duration: 0, useNativeDriver: true }),
        Animated.timing(mainOpacity, { toValue: 1, duration: 0, useNativeDriver: true }),
        Animated.timing(cyanOpacity, { toValue: 0, duration: 0, useNativeDriver: true }),
        Animated.timing(magentaOpacity, { toValue: 1, duration: 0, useNativeDriver: true }),
      ]),
      Animated.delay(60),
      // Frame 3: flicker off
      Animated.parallel([
        Animated.timing(mainOpacity, { toValue: 0, duration: 0, useNativeDriver: true }),
        Animated.timing(magentaOpacity, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
      Animated.delay(40),
      // Frame 4: snap back
      Animated.parallel([
        Animated.timing(skewX, { toValue: -3, duration: 0, useNativeDriver: true }),
        Animated.timing(translateX, { toValue: -2, duration: 0, useNativeDriver: true }),
        Animated.timing(mainOpacity, { toValue: 0.9, duration: 0, useNativeDriver: true }),
      ]),
      Animated.delay(80),
      // Frame 5: reset
      Animated.parallel([
        Animated.timing(skewX, { toValue: 0, duration: 0, useNativeDriver: true }),
        Animated.timing(translateX, { toValue: 0, duration: 0, useNativeDriver: true }),
        Animated.timing(mainOpacity, { toValue: 1, duration: 0, useNativeDriver: true }),
      ]),
      // Quick micro-glitch after short pause
      Animated.delay(400),
      Animated.parallel([
        Animated.timing(skewX, { toValue: 3, duration: 0, useNativeDriver: true }),
        Animated.timing(translateX, { toValue: -3, duration: 0, useNativeDriver: true }),
      ]),
      Animated.delay(50),
      Animated.parallel([
        Animated.timing(skewX, { toValue: 0, duration: 0, useNativeDriver: true }),
        Animated.timing(translateX, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    ]);

    Animated.loop(glitchSequence).start();
  }, []);

  useEffect(() => {
    runGlitchLoop();

    // Scan line loop
    Animated.loop(
      Animated.timing(scanY, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const skewInterpolation = skewX.interpolate({
    inputRange: [-10, 10],
    outputRange: ["-10deg", "10deg"],
  });

  const scanTranslateY = scanY.interpolate({
    inputRange: [0, 1],
    outputRange: [-400, 400],
  });

  return (
    <View style={styles.container}>
      {/* Scan line */}
      <Animated.View
        style={[
          styles.scanLine,
          { transform: [{ translateY: scanTranslateY }] },
        ]}
      />

      <View style={styles.textContainer}>
        {/* Cyan offset */}
        <Animated.Text
          style={[
            styles.text,
            styles.glitchLayer,
            {
              color: colors.glitchCyan,
              opacity: cyanOpacity,
              transform: [{ skewX: "-3deg" }, { translateX: -3 }],
            },
          ]}
        >
          {GLITCH_TEXT}
        </Animated.Text>

        {/* Magenta offset */}
        <Animated.Text
          style={[
            styles.text,
            styles.glitchLayer,
            {
              color: colors.glitchMagenta,
              opacity: magentaOpacity,
              transform: [{ skewX: "3deg" }, { translateX: 3 }],
            },
          ]}
        >
          {GLITCH_TEXT}
        </Animated.Text>

        {/* Main text */}
        <Animated.Text
          style={[
            styles.text,
            {
              opacity: mainOpacity,
              transform: [{ skewX: skewInterpolation }, { translateX }],
            },
          ]}
        >
          {GLITCH_TEXT}
        </Animated.Text>
      </View>

      <Animated.Text style={styles.subText}>INITIALIZING</Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    position: "relative",
  },
  text: {
    fontFamily: "Courier",
    fontSize: 48,
    fontWeight: "bold",
    color: colors.textPrimary,
    letterSpacing: 12,
  },
  glitchLayer: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  subText: {
    fontFamily: "Courier",
    fontSize: 14,
    color: colors.textMuted,
    letterSpacing: 6,
    marginTop: 24,
  },
  scanLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.accentPurple,
    opacity: 0.3,
  },
});
