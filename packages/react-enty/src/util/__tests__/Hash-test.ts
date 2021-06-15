import Hash from '../Hash';

describe('Hash', () => {
    it('will hash objects consitently', () => {
        const aa = Hash({foo: 'bar'});
        const bb = Hash({foo: 'bar'});
        expect(aa).toBe(bb);
    });

    it('will return a string', () => {
        const aa = Hash({foo: 'bar'});
        expect(typeof aa).toBe('string');
    });
});
