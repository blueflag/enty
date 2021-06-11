export default new Store({
    brandList: {
        schema: BrandListSchema,
        methods: {
            get: async () => {},
        }
    },
    feed: {
        schema: FeedSchema,
        methods: {
            get: async () => {},
            update: async () => {},
            markAsRead: async () => {},
        }
    },
    feedList: {
        schema: FeedListSchema,
        ttl: 300,
        methods: {
            get: async () => {},
            add: async () => {},
            remove: async () => {},
        }

    }
});


function Thing() {
    const [feedList, {pending}] = useEntity({
        type: 'feedList',
        id: key,
        method: 'get',
        ttl: 300
    });

    useEffect(() => {
        request({id}, {meta});
    });
}




