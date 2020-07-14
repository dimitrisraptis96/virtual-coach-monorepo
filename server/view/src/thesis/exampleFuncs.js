function setBoneRotation(boneName, axis, theta) {
  const quaternion = new THREE.Quaternion();
  quaternion.setFromAxisAngle(axis, theta);

  const bone = main.model.b[boneName];
  bone.setRotationFromQuaternion(quaternion);
}
