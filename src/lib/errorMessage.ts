import { ConvexError } from 'convex/values';

export default (error: unknown): string => {
    if (error instanceof ConvexError && typeof error.data === 'string') {
        return error.data;
    }

    return 'Something went wrong';
};
