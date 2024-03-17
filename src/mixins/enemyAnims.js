export default anims => {
    anims.create({
        key: 'enemy-idle',
        frames: anims.generateFrameNumbers('enemy', {start: 0, end: 8}),
        frameRate: 8,
        repeat: -1
    });

    anims.create({
        key: 'enemy-walk',
        frames: anims.generateFrameNumbers('enemy', {start: 0, end: 8}),
        frameRate: 8,
        repeat: -1
    });
}