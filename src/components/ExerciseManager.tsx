import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Animated,
  StyleSheet,
} from "react-native";
import { Pencil, Trash2 } from "lucide-react-native";
import type { Exercise } from "../types";
import { useWorkoutStore } from "../stores/workoutStore";
import { colors, spacing, typography } from "../theme";
import SystemCard from "./SystemCard";

const ROW_HEIGHT = 48;
const SLICE_COUNT = 5;
const SLICE_HEIGHT = ROW_HEIGHT / SLICE_COUNT;

function ExerciseRow({
  exercise,
  onEdit,
  onDelete,
}: {
  exercise: Exercise;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const sliceAnims = useRef(
    Array.from({ length: SLICE_COUNT }, () => ({
      translateX: new Animated.Value(0),
      opacity: new Animated.Value(1),
    }))
  ).current;
  const rowOpacity = useRef(new Animated.Value(1)).current;

  const handleDelete = () => {
    setDeleting(true);

    const animations = sliceAnims.map((anim, i) => {
      const direction = i % 2 === 0 ? 1 : -1;
      const distance = (40 + Math.random() * 60) * direction;
      return Animated.parallel([
        Animated.timing(anim.translateX, {
          toValue: distance,
          duration: 400,
          delay: i * 30,
          useNativeDriver: true,
        }),
        Animated.timing(anim.opacity, {
          toValue: 0,
          duration: 400,
          delay: i * 30,
          useNativeDriver: true,
        }),
      ]);
    });

    Animated.parallel(animations).start(() => {
      Animated.timing(rowOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: false,
      }).start(() => {
        onDelete();
      });
    });
  };

  if (deleting) {
    return (
      <Animated.View style={{ opacity: rowOpacity }}>
        <View style={[styles.row, { height: ROW_HEIGHT, position: "relative" }]}>
          {sliceAnims.map((anim, i) => {
            const sliceColor = i % 2 === 0 ? colors.glitchCyan : colors.glitchMagenta;
            return (
              <Animated.View
                key={i}
                style={{
                  position: "absolute",
                  top: i * SLICE_HEIGHT,
                  left: 0,
                  right: 0,
                  height: SLICE_HEIGHT,
                  backgroundColor: colors.bgTertiary,
                  borderWidth: 1,
                  borderColor: sliceColor,
                  transform: [{ translateX: anim.translateX }],
                  opacity: anim.opacity,
                }}
              />
            );
          })}
        </View>
      </Animated.View>
    );
  }

  return (
    <View style={styles.row}>
      <Text style={styles.exerciseName}>{exercise.name}</Text>
      <Text style={styles.exerciseOrder}>#{exercise.order}</Text>
      <View style={styles.rowActions}>
        <Pressable onPress={onEdit} hitSlop={8} style={styles.iconBtn}>
          <Pencil size={16} color={colors.textSecondary} />
        </Pressable>
        <Pressable onPress={handleDelete} hitSlop={8} style={styles.iconBtn}>
          <Trash2 size={16} color={colors.accentRed} />
        </Pressable>
      </View>
    </View>
  );
}

function InlineForm({
  initialName,
  onSave,
  onCancel,
}: {
  initialName: string;
  onSave: (name: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initialName);

  return (
    <View style={styles.formRow}>
      <TextInput
        style={styles.formInput}
        value={name}
        onChangeText={setName}
        placeholder="Nom de l'exercice"
        placeholderTextColor={colors.textMuted}
        autoFocus
      />
      <View style={styles.formButtons}>
        <Pressable onPress={onCancel} style={styles.formCancelBtn}>
          <Text style={styles.formCancelText}>ANNULER</Text>
        </Pressable>
        <Pressable
          onPress={() => name.trim() && onSave(name.trim())}
          style={[styles.formSaveBtn, !name.trim() && { opacity: 0.4 }]}
          disabled={!name.trim()}
        >
          <Text style={styles.formSaveText}>SAUVEGARDER</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function ExerciseManager() {
  const { allExercises, addExercise, renameExercise, removeExercise } =
    useWorkoutStore();

  // null = no form, "new" = add form, string = editing exercise id
  const [formState, setFormState] = useState<null | "new" | string>(null);

  const handleSaveNew = (name: string) => {
    addExercise(name);
    setFormState(null);
  };

  const handleSaveEdit = (id: string, name: string) => {
    renameExercise(id, name);
    setFormState(null);
  };

  const handleDelete = (id: string) => {
    removeExercise(id);
  };

  return (
    <SystemCard style={styles.card}>
      <Text style={styles.header}>EXERCICES</Text>

      {allExercises.map((exercise) => (
        <React.Fragment key={exercise.id}>
          <ExerciseRow
            exercise={exercise}
            onEdit={() => setFormState(exercise.id)}
            onDelete={() => handleDelete(exercise.id)}
          />
          {formState === exercise.id && (
            <InlineForm
              initialName={exercise.name}
              onSave={(name) => handleSaveEdit(exercise.id, name)}
              onCancel={() => setFormState(null)}
            />
          )}
        </React.Fragment>
      ))}

      {formState === "new" ? (
        <InlineForm
          initialName=""
          onSave={handleSaveNew}
          onCancel={() => setFormState(null)}
        />
      ) : (
        <Pressable
          onPress={() => setFormState("new")}
          style={styles.addButton}
        >
          <Text style={styles.addButtonText}>AJOUTER UN EXERCICE</Text>
        </Pressable>
      )}
    </SystemCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  header: {
    ...typography.heading,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    height: ROW_HEIGHT,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  exerciseName: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  exerciseOrder: {
    ...typography.monoSm,
    color: colors.textMuted,
    marginRight: spacing.md,
  },
  rowActions: {
    flexDirection: "row",
    gap: spacing.md,
  },
  iconBtn: {
    padding: spacing.xs,
  },
  formRow: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  formInput: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgSecondary,
    padding: spacing.sm,
    ...typography.body,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  formButtons: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  formCancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 8,
    alignItems: "center",
  },
  formCancelText: {
    ...typography.heading,
    fontSize: 14,
    color: colors.textSecondary,
  },
  formSaveBtn: {
    flex: 1,
    backgroundColor: colors.accentBlue,
    paddingVertical: 8,
    alignItems: "center",
  },
  formSaveText: {
    ...typography.heading,
    fontSize: 14,
    color: colors.bgPrimary,
  },
  addButton: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  addButtonText: {
    ...typography.heading,
    fontSize: 14,
    color: colors.textSecondary,
  },
});
