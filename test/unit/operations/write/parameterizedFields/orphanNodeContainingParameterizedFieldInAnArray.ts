import { CacheContext } from '../../../../../src/context';
import { GraphSnapshot } from '../../../../../src/GraphSnapshot';
import { nodeIdForParameterizedValue } from '../../../../../src/operations/SnapshotEditor';
import { write } from '../../../../../src/operations/write';
import { NodeId, RawOperation, StaticNodeId } from '../../../../../src/schema';
import { query, strictConfig } from '../../../../helpers';

const { QueryRoot: QueryRootId } = StaticNodeId;

// These are really more like integration tests, given the underlying machinery.
//
// It just isn't very fruitful to unit test the individual steps of the write
// workflow in isolation, given the contextual state that must be passed around.
describe(`operations.write`, () => {

  const context = new CacheContext(strictConfig);
  const empty = new GraphSnapshot();

  describe(`parameterized fields`, () => {

    describe(`removing array nodes that contain parameterized values`, () => {

      let rootedQuery: RawOperation, snapshot: GraphSnapshot, entityBarId0: NodeId, entityBarId1: NodeId;
      beforeAll(() => {
        rootedQuery = query(`{
          foo {
            bar(extra: true) {
              baz { id }
            }
          }
        }`);

        entityBarId0 = nodeIdForParameterizedValue(QueryRootId, ['foo', 0, 'bar'], { extra: true });
        entityBarId1 = nodeIdForParameterizedValue(QueryRootId, ['foo', 1, 'bar'], { extra: true });

        const { snapshot: baseSnapshot } = write(context, empty, rootedQuery, {
          foo: [
            { bar: { baz: { id: 1 } } },
            { bar: { baz: { id: 2 } } },
          ],
        });

        const result = write(context, baseSnapshot, rootedQuery, {
          foo: [
            { bar: { baz: { id: 1 } } },
          ],
        });
        snapshot = result.snapshot;
      });

      it(`doesn't contain the orphaned parameterized value`, () => {
        expect(snapshot.allNodeIds()).to.not.include(entityBarId1);
      });

      it(`doesn't contain transitively orphaned nodes`, () => {
        expect(snapshot.allNodeIds()).to.not.include('2');
      });

    });
  });

});
