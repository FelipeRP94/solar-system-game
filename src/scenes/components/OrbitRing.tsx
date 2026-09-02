export const OrbitRing = ({ radius }: { radius: number }) => {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radius - 0.012, radius + 0.012, 96]} />
      <meshBasicMaterial color="#34476e" transparent opacity={0.45} />
    </mesh>
  );
};
