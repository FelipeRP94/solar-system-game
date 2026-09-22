export const getOrbitRingGeometry = (radius: number) => ({
  innerRadius: radius - 0.012,
  outerRadius: radius + 0.012,
  segments: 96,
  center: [0, 0, 0] as const,
});

export const OrbitRing = ({ radius }: { radius: number }) => {
  const geometry = getOrbitRingGeometry(radius);
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[geometry.innerRadius, geometry.outerRadius, geometry.segments]} />
      <meshBasicMaterial color="#34476e" transparent opacity={0.45} />
    </mesh>
  );
};
