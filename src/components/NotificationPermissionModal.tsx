import React, { useEffect, useRef } from "react";
import { Modal, View, Text, Pressable, Animated, StyleSheet } from "react-native";
import { colors, spacing, typography } from "../theme";

const CHAMFER_SIZE = 8;

interface NotificationPermissionModalProps {
  visible: boolean;
  onAccept: () => void;
  onDismiss: () => void;
}

export default function NotificationPermissionModal({
  visible,
  onAccept,
  onDismiss,
}: NotificationPermissionModalProps) {
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(20)).current;
  const glitchTranslateX = useRef(new Animated.Value(0)).current;
  const glitchSkewX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;

    backdropOpacity.setValue(0);
    cardOpacity.setValue(0);
    cardTranslateY.setValue(20);

    // Glitch entrance: rapid skew/translate burst, then card fades in
    Animated.sequence([
      // Glitch burst
      Animated.parallel([
        Animated.timing(glitchTranslateX, { toValue: -6, duration: 0, useNativeDriver: true }),
        Animated.timing(glitchSkewX, { toValue: -4, duration: 0, useNativeDriver: true }),
        Animated.timing(cardOpacity, { toValue: 0.6, duration: 0, useNativeDriver: true }),
      ]),
      Animated.delay(60),
      Animated.parallel([
        Animated.timing(glitchTranslateX, { toValue: 5, duration: 0, useNativeDriver: true }),
        Animated.timing(glitchSkewX, { toValue: 3, duration: 0, useNativeDriver: true }),
        Animated.timing(cardOpacity, { toValue: 0.8, duration: 0, useNativeDriver: true }),
      ]),
      Animated.delay(60),
      Animated.parallel([
        Animated.timing(glitchTranslateX, { toValue: -2, duration: 0, useNativeDriver: true }),
        Animated.timing(glitchSkewX, { toValue: -1, duration: 0, useNativeDriver: true }),
      ]),
      Animated.delay(40),
      // Settle
      Animated.parallel([
        Animated.timing(glitchTranslateX, { toValue: 0, duration: 100, useNativeDriver: true }),
        Animated.timing(glitchSkewX, { toValue: 0, duration: 100, useNativeDriver: true }),
        Animated.timing(cardOpacity, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.timing(cardTranslateY, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]),
    ]).start();
  }, [visible]);

  const skewInterpolate = glitchSkewX.interpolate({
    inputRange: [-10, 10],
    outputRange: ["-10deg", "10deg"],
  });

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.wrapper}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
        <Animated.View
          style={[
            styles.card,
            {
              opacity: cardOpacity,
              transform: [
                { translateY: cardTranslateY },
                { translateX: glitchTranslateX },
                { skewX: skewInterpolate },
              ],
            },
          ]}
        >
          <View style={styles.chamfer} />
          <Text style={styles.title}>NOTIFICATIONS</Text>
          <Text style={styles.body}>
            Activer les rappels d'entraînement ?
          </Text>
          <View style={styles.buttons}>
            <Pressable onPress={onDismiss} style={styles.ghostBtn}>
              <Text style={styles.ghostText}>PLUS TARD</Text>
            </Pressable>
            <Pressable onPress={onAccept} style={styles.primaryBtn}>
              <Text style={styles.primaryText}>ACTIVER</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  card: {
    backgroundColor: colors.bgSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    width: "100%",
    overflow: "hidden",
  },
  chamfer: {
    position: "absolute",
    top: -1,
    left: -1,
    width: 0,
    height: 0,
    borderStyle: "solid",
    borderTopWidth: CHAMFER_SIZE,
    borderRightWidth: CHAMFER_SIZE,
    borderTopColor: "rgba(0,0,0,0.7)",
    borderRightColor: "transparent",
    zIndex: 1,
  },
  title: {
    ...typography.heading,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  buttons: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  ghostBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    alignItems: "center",
  },
  ghostText: {
    ...typography.heading,
    fontSize: 16,
    color: colors.textSecondary,
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: colors.accentBlue,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryText: {
    ...typography.heading,
    fontSize: 16,
    color: colors.bgPrimary,
  },
});
