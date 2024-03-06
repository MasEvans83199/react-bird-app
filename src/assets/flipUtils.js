// flipUtils.js

// Helper function to calculate the difference between two bounding boxes
function getBoundingBoxDifference(bounds1, bounds2) {
  if (!bounds1 || !bounds2) {
    return {
      x: 0,
      y: 0,
      scaleX: 1,
      scaleY: 1,
    };
  }

  return {
    x: bounds1.left - bounds2.left,
    y: bounds1.top - bounds2.top,
    scaleX: bounds1.width / bounds2.width,
    scaleY: bounds1.height / bounds2.height,
  };
}

// Helper function to remove the effects of transform from the bounding box
function removeTransformFromBounds(bounds, transform) {
  if (!bounds || !transform) {
    return bounds;
  }

  return {
    left: bounds.left - transform.x,
    top: bounds.top - transform.y,
    width: bounds.width / transform.scaleX,
    height: bounds.height / transform.scaleY,
  };
}

// Helper function to apply transform to the bounds
function applyTransformToBounds(bounds, transform) {
  if (!bounds || !transform) {
    return bounds;
  }

  return {
    left: bounds.left + transform.x,
    top: bounds.top + transform.y,
    width: bounds.width * transform.scaleX,
    height: bounds.height * transform.scaleY,
  };
}

// Helper function to get the inverted transform from two bounding boxes
function getInvertedTransform(fromBounds, toBounds) {
  const transform = getBoundingBoxDifference(toBounds, fromBounds);
  return {
    x: -transform.x,
    y: -transform.y,
    scaleX: 1 / transform.scaleX,
    scaleY: 1 / transform.scaleY,
  };
}

// Helper function to perform the animation
function animate({ from, to, duration, onUpdate, onComplete }) {
  const start = performance.now();
  const durationMs = duration || 1000;

  const animateFrame = () => {
    const elapsed = performance.now() - start;
    const progress = Math.min(elapsed / durationMs, 1);
    const transform = {
      x: from.x + (to.x - from.x) * progress,
      y: from.y + (to.y - from.y) * progress,
      scaleX: from.scaleX + (to.scaleX - from.scaleX) * progress,
      scaleY: from.scaleY + (to.scaleY - from.scaleY) * progress,
    };

    onUpdate(transform);

    if (progress < 1) {
      requestAnimationFrame(animateFrame);
    } else {
      onComplete();
    }
  };

  requestAnimationFrame(animateFrame);

  return {
    stop() {
      // Stop the animation if needed
    },
  };
}

export {
  animate,
  applyTransformToBounds,
  getInvertedTransform,
  removeTransformFromBounds,
};
