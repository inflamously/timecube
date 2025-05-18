<script lang="ts">
    import * as THREE from 'three'
    import blackSide from '../assets/black.png'
    import redSide from '../assets/red.png'
    import blueSide from '../assets/blue.png'
    import whiteSide from '../assets/white.png'
    import yellowSide from '../assets/yellow.png'
    import greenSide from '../assets/green.png'
    import {render} from "svelte/server";
    import {onMount} from "svelte";
    import {Euler, Quaternion, Vector2, Vector3, Vector4} from "three";
    import type {HTMLQuoteAttributes} from "svelte/elements";

    let divElement: HTMLElement | undefined = undefined;

    $effect(() => {
            function getVectorDirectionVisibilityMatrix(quatA: Quaternion, quatB: Quaternion, toleranceOffset = 0.7) {
                const aMatrix = getVectorDirectionMatrix(quatA)
                const bMatrix = getVectorDirectionMatrix(quatB)

                return {
                    forward: aMatrix.forward.dot(bMatrix.forward) > toleranceOffset,
                    right: aMatrix.right.dot(bMatrix.forward) > toleranceOffset,
                    up: aMatrix.up.dot(bMatrix.forward) > toleranceOffset,
                    backward: aMatrix.backward.dot(bMatrix.forward) > toleranceOffset,
                    down: aMatrix.down.dot(bMatrix.forward) > toleranceOffset,
                    left: aMatrix.left.dot(bMatrix.forward) > toleranceOffset,
                }
            }

            function getVectorDirectionMatrix(rotation: Quaternion) {
                const forward = new Vector3(0, 0, 1).applyQuaternion(rotation)
                const right = new Vector3(1, 0, 0).applyQuaternion(rotation)
                const up = new Vector3(0, 1, 0).applyQuaternion(rotation)

                return {
                    forward,
                    right,
                    up,
                    backward: forward.clone().negate(),
                    down: up.clone().negate(),
                    left: right.clone().negate(),
                }
            }

            function setupCube() {
                const textureLoader = new THREE.TextureLoader()

                const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
                const cubeMaterials = [
                    new THREE.MeshBasicMaterial({
                        map: textureLoader.load(blackSide)
                    }),
                    new THREE.MeshBasicMaterial({
                        map: textureLoader.load(blueSide)
                    }),
                    new THREE.MeshBasicMaterial({
                        map: textureLoader.load(whiteSide)
                    }),
                    new THREE.MeshBasicMaterial({
                        map: textureLoader.load(redSide)
                    }),
                    new THREE.MeshBasicMaterial({
                        map: textureLoader.load(yellowSide)
                    }),
                    new THREE.MeshBasicMaterial({
                        map: textureLoader.load(greenSide),
                    })
                ]
                // cubeMaterials.forEach((mat) => {
                //     if (!mat || !mat.map) {
                //         return;
                //     }
                //     mat.map.center.set(0.5, 0.5)
                // })
                return new THREE.Mesh(cubeGeometry, cubeMaterials)
            }

            function setupDebugLines(type: 'red' | 'blue' | 'green') {
                // 1. Get the cube's world position
                let cubePosition = new THREE.Vector3();
                entCube.getWorldPosition(cubePosition);

                let directionMatrix = getVectorDirectionMatrix(entCube.quaternion)

                const lineLength = 2;
                let color: number = 0x000000;
                let endPosition: Vector3 | undefined = undefined;
                switch (type) {
                    case 'red':
                        endPosition = directionMatrix.forward.clone().multiplyScalar(lineLength);
                        color = 0xFF0000;
                        break
                    case 'blue':
                        endPosition = directionMatrix.up.clone().multiplyScalar(lineLength);
                        color = 0x0000FF;
                        break
                    case 'green':
                        endPosition = directionMatrix.right.clone().multiplyScalar(lineLength);
                        color = 0x00FF00;
                        break
                    default:
                        endPosition = new Vector3(0, 0, 0);
                        break
                }

                // Line from -> to
                let points = [cubePosition, cubePosition.clone().add(endPosition)];
                let geometry = new THREE.BufferGeometry().setFromPoints(points);

                // 5. Create the line material and object
                let material = new THREE.LineBasicMaterial({color});
                return new THREE.Line(geometry, material);
            }

            function worldPointFromScreenPoint(screenPoint: THREE.Vector2, camera: THREE.Camera) {
                let worldPoint = new THREE.Vector3();
                worldPoint.x = screenPoint.x;
                worldPoint.y = screenPoint.y;
                worldPoint.z = 0;
                worldPoint.unproject(camera);
                return worldPoint;
            }

            function getViewportPointerPosition(ev: MouseEvent, domElement: HTMLElement, camera: THREE.Camera): THREE.Vector3 {
                // Relative screen position
                // (WebGL is -1 to 1 left to right, 1 to -1 top to bottom)
                const rect = domElement.getBoundingClientRect();
                let viewportDown = new THREE.Vector2();
                viewportDown.x = (((ev.clientX - rect.left) / rect.width) * 2) - 1;
                viewportDown.y = -(((ev.clientY - rect.top) / rect.height) * 2) + 1;
                // Get 3d point
                return worldPointFromScreenPoint(viewportDown, camera);
            }

            function snapCubeSide() {
                if (cubeWindowVisibleMatrix) {
                    const quat = new THREE.Quaternion();
                    if (cubeWindowVisibleMatrix.forward) {
                        quat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0)
                    } else if (cubeWindowVisibleMatrix.backward) {
                        quat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI)
                    } else if (cubeWindowVisibleMatrix.right) {
                        quat.setFromAxisAngle(new THREE.Vector3(0, -1, 0), Math.PI / 2)
                    } else if (cubeWindowVisibleMatrix.left) {
                        quat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2)
                    } else if (cubeWindowVisibleMatrix.up) {
                        quat.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2)
                    } else if (cubeWindowVisibleMatrix.down) {
                        quat.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2)
                    }
                    entCube.setRotationFromQuaternion(quat)
                }
            }

            function startMoveCube(ev: TouchEvent | MouseEvent) {
                try {
                    const boundingRect = (ev.target as HTMLElement).getBoundingClientRect();
                    if (isTouchEvent) {
                        startPosition = new THREE.Vector3(ev.targetTouches[0].pageX / boundingRect.width, ev.targetTouches[0].pageY / boundingRect.height, 0)
                    } else {
                        startPosition = new THREE.Vector3(ev.offsetX / boundingRect.width, ev.offsetY / boundingRect.height, 0)
                    }
                    drag = true
                } catch (e) {
                    console.error(e)
                }
            }

            function stopMoveCube(ev) {
                startPosition = new THREE.Vector3(0, 0, 0);
                drag = false;
                snapCubeSide(cubeWindowVisibleMatrix)
                renderLines()
            }

            function moveCube(ev) {

                try {
                    if (drag && startPosition) {
                        let currentPosition: THREE.Vector3;
                        const boundingRect = (ev.target as HTMLElement).getBoundingClientRect();

                        if (isTouchEvent) {
                            currentPosition = new THREE.Vector3(ev.targetTouches[0].pageX / boundingRect.width, ev.targetTouches[0].pageY / boundingRect.height, 0)
                        } else {
                            currentPosition = new THREE.Vector3(ev.offsetX / boundingRect.width, ev.offsetY / boundingRect.height, 0)
                        }

                        const deltaX = currentPosition.x - startPosition.x
                        const deltaY = currentPosition.y - startPosition.y
                        const toleranceXY = 0.1
                        const deltaSpeed = 2;
                        const rotQuat = new THREE.Quaternion();
                        rotQuat.setFromAxisAngle(new THREE.Vector3(1, 0, 0), deltaY * deltaSpeed)
                        entCube.quaternion.premultiply(rotQuat)
                        rotQuat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), deltaX * deltaSpeed)
                        entCube.quaternion.premultiply(rotQuat)
                        renderLines()
                        cubeWindowVisibleMatrix = getVectorDirectionVisibilityMatrix(entCube.quaternion, camera.quaternion)
                        startPosition = currentPosition;
                    }
                } catch (e) {
                    console.error(e)
                }
            }

            // Setup
            const scene = new THREE.Scene()
            scene.background = new THREE.Color("#ED9C9E")
            const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            const renderer = $state(new THREE.WebGLRenderer({
                powerPreference: 'low-power',
            }));
            const renderSize = {
                w: window.innerWidth * .8,
                h: window.innerHeight * .8,
            };
            renderer.setSize(renderSize.w, renderSize.h);

            // Delta Time
            const clock = new THREE.Clock()

            // Add entities
            const entCube = setupCube()
            scene.add(entCube)

            // Set camera in front
            const cameraMatrixDirection = getVectorDirectionMatrix(camera.quaternion)
            camera.position.z = 2

            // Setup Renderer & Update Loop
            function update() {
                requestAnimationFrame(update)
                renderer.render(scene, camera);
            }

            renderer.setAnimationLoop(update)

            // Mouse movement
            let drag = false;
            let startPosition: THREE.Vector3 = new THREE.Vector3();
            let movementDirection: 'left' | 'up' | 'down' | 'right' | undefined = undefined

            let lineUp: THREE.Line | undefined = undefined;
            let lineForward: THREE.Line | undefined = undefined;
            let lineRight: THREE.Line | undefined = undefined;
            let cubeWindowVisibleMatrix: ReturnType<typeof getVectorDirectionVisibilityMatrix> | undefined = undefined;

            function renderLines() {
                if (lineForward) {
                    scene.remove(lineForward)
                    lineForward.geometry.dispose()
                }
                lineForward = setupDebugLines('green')
                scene.add(lineForward)

                if (lineUp) {
                    scene.remove(lineUp)
                    lineUp.geometry.dispose()
                }
                lineUp = setupDebugLines('red')
                scene.add(lineUp)

                if (lineRight) {
                    scene.remove(lineRight)
                    lineRight.geometry.dispose()
                }
                lineRight = setupDebugLines('blue')
                scene.add(lineRight)
            }

            renderLines()

            let isTouchEvent = false;
            renderer.domElement.addEventListener('mousedown', (ev) => {
                isTouchEvent = false;
                startMoveCube(ev)
            })
            renderer.domElement.addEventListener('mouseup', (ev) => stopMoveCube(ev))
            renderer.domElement.addEventListener('mouseleave', (ev) => stopMoveCube(ev))
            renderer.domElement.addEventListener('mousemove', (ev) => moveCube(ev))
            renderer.domElement.addEventListener('touchstart', (ev) => {
                isTouchEvent = true;
                startMoveCube(ev)
            })
            renderer.domElement.addEventListener('touchmove', (ev) => moveCube(ev))
            renderer.domElement.addEventListener('touchend', (ev) => stopMoveCube(ev))

            if (divElement) {
                divElement.appendChild(renderer.domElement);
            }
        }
    )
</script>

<div bind:this={divElement}>
</div>

<style>
</style>