# Segments (skills) conventions

## Folder layout

Each segment must live in its own folder:

- `core/sgmnt/<segment>/index.ts`

`index.ts` must export a factory function:

- `create<SegmentName>Segment(BSConfig)`

The factory returns an object with the same shape used by `core/sgmnt/map.ts`:

- `handler: (args?: any) => Promise<any>`
- `meta: { description: string; implemented: boolean; config?: any }`

## map.ts responsibilities

`core/sgmnt/map.ts` is the composer:

- loads config (`loadBoxSafeConfig`)
- instantiates each segment via its factory
- exposes `{ routes, runSegment, BSConfig }`

## Adding a new segment

1. Create folder `core/sgmnt/<segment>/`
2. Implement `index.ts` exporting `create<SegmentName>Segment`
3. Register it inside `core/sgmnt/map.ts` under `routes`.
