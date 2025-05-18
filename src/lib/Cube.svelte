<script lang="ts">
    import * as THREE from 'three'
    import blackSide from '../assets/black.png'
    import redSide from '../assets/red.png'
    import blueSide from '../assets/blue.png'
    import whiteSide from '../assets/white.png'
    import yellowSide from '../assets/yellow.png'
    import greenSide from '../assets/green.png'

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

    function setupDebugLines(type: 'red' | 'blue' = 'red') {
        // 1. Get the cube's world position
        let start = new THREE.Vector3();
        entCube.getWorldPosition(start);

        // 2. Get the direction (e.g., local Y axis for "up"—adjust if you want a different direction)
        let direction
        if (type === 'red') {
            direction = new THREE.Vector3(0, 1, 0); // Local up
            direction.applyQuaternion(entCube.quaternion); // Rotate to match cube's orientation
        }
        if (type === 'blue') {
            direction = new THREE.Vector3(1, 0, 0); // Local up
            direction.applyQuaternion(entCube.quaternion); // Rotate to match cube's orientation
        }
        // 3. Calculate the end point (e.g., 2 units long)
        let length = 2;
        let end = start.clone().add(direction.multiplyScalar(length));

        // 4. Create geometry for the line
        let points = [start, end];
        let geometry = new THREE.BufferGeometry().setFromPoints(points);

        // 5. Create the line material and object
        let material = new THREE.LineBasicMaterial({ color: type === 'red' ? 0xff0000 : 0x0000ff });
        return new THREE.Line(geometry, material);
    }

    function worldPointFromScreenPoint( screenPoint: THREE.Vector2, camera: THREE.Camera ) {
        let worldPoint = new THREE.Vector3();
        worldPoint.x = screenPoint.x;
        worldPoint.y = screenPoint.y;
        worldPoint.z = 0;
        worldPoint.unproject( camera );
        return worldPoint;
    }

    function getViewportPointerPosition(ev: MouseEvent, domElement: HTMLElement, camera: THREE.Camera): THREE.Vector3 {
        // Relative screen position
        // (WebGL is -1 to 1 left to right, 1 to -1 top to bottom)
        const rect = domElement.getBoundingClientRect();
        let viewportDown = new THREE.Vector2();
        viewportDown.x =   ( ( ( ev.clientX - rect.left) / rect.width ) * 2 ) - 1;
        viewportDown.y = - ( ( ( ev.clientY - rect.top) / rect.height ) * 2 ) + 1;

        // Get 3d point
        return worldPointFromScreenPoint( viewportDown, camera );
    }

    // Setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color("#ED9C9E")
    const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth * .5, window.innerHeight * .5 );

    // Delta Time
    const clock = new THREE.Clock()

    // Add entities
    const entCube = setupCube()
    scene.add(entCube)

    // Set camera in front
    camera.position.z = 2

    // Setup Renderer & Update Loop
    function update() {
        requestAnimationFrame(update)

        const deltaTime = clock.getDelta()
        renderer.render(scene, camera);
        // console.log(deltaTime, entCube.rotation.x);
        // entCube.rotation.x += deltaTime;
        // entCube.rotateX(entCube.rotation.x+deltaTime);
    }
    renderer.setAnimationLoop(update)

    // Mouse movement
    let drag = false;
    let startPosition: THREE.Vector3 = new THREE.Vector3();
    let movementDirection: 'left' | 'up' | 'down' | 'right' | undefined = undefined
    let lineUp: THREE.Line | undefined = undefined;
    let lineRight: THREE.Line | undefined = undefined;

    function moveCube() {
        if (movementDirection) {
            let quat = new THREE.Quaternion();
            const rotationOffset = Math.PI / 4
            console.log("move cube!");

            switch (movementDirection!) {
                case 'up':
                    quat.setFromAxisAngle(new THREE.Vector3(1, 0, 0), rotationOffset)
                    break;
                case 'down':
                    quat.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -rotationOffset)
                    break;
                case 'left':
                    quat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rotationOffset)
                    break;
                case 'right':
                    quat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -rotationOffset)
                    break;
            }
            entCube.quaternion.premultiply(quat)
            console.log(entCube.rotation)
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
    }

    renderer.domElement.addEventListener('mousedown', (ev) => {
        // startPosition = new THREE.Vector3(ev.clientX, ev.clientY, 0)
        startPosition = getViewportPointerPosition(ev, renderer.domElement, camera);
        drag = true;
    })
    renderer.domElement.addEventListener('mouseup', (ev) => {
        startPosition = new THREE.Vector3();
        drag = false;
        moveCube()
    })
    renderer.domElement.addEventListener('mouseleave', (ev) => {
        startPosition = new THREE.Vector3();
        drag = false;
    })
    renderer.domElement.addEventListener('mousemove', (ev) => {
        if (drag && startPosition) {
            const currentPosition = getViewportPointerPosition(ev, renderer.domElement, camera);
            const deltaX = currentPosition.x - startPosition.x
            const deltaY = currentPosition.y - startPosition.y
            const toleranceXY = 0.01

            if (deltaX > toleranceXY) {
                movementDirection = 'right'
            } else if (deltaX < -toleranceXY) {
                movementDirection = 'left'
            }

            if (deltaY > toleranceXY) {
                movementDirection = 'up'
            } else if (deltaY < -toleranceXY) {
                movementDirection = 'down'
            }
        }
    })

    renderer.domElement.addEventListener('touchmove', (ev) => {
        console.log(ev);
    })

    // Render the dom element for webgl
    let divElement: HTMLElement | undefined = undefined;
    $: if(divElement) {
        divElement.appendChild( renderer.domElement );
    }
</script>

<div bind:this={divElement}>
</div>

<style>
</style>