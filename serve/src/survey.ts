import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import Store from './store';
import { Response } from './types';

interface SurveyData {
    id: string;
    name: string;
    age: number;
    gender: string;
    surveyResult: string;
    createdAt: number;
}

/**
 * Survey 类
 * 问卷调查相关的数据操作
 */
class Survey {
    store: Store;

    constructor() {
        this.store = new Store(path.resolve(__dirname, 'data/survey.json')); // 创建数据存储对象
    }

    // 保存问卷调查数据
    async save(data: Omit<SurveyData, 'id' | 'createdAt'>): Promise<Response<SurveyData>> {
        const newData: SurveyData = { ...data, id: uuidv4(), createdAt: Date.now() }; // 生成新数据并保存
        await this.store.save(newData);
        console.log(`已将问卷调查数据 ${JSON.stringify(newData)} 保存至文件`); // 控制台输出提示信息
        return {
            code: 0,
            message: '提交成功',
            data: newData,
        };
    }

    // 查询所有问卷调查数据
    async list(): Promise<Response<SurveyData[]>> {
        const data = await this.store.read(); // 从数据存储对象中读取数据
        console.log(`查询到 ${data.length} 条问卷调查数据`); // 控制台输出提示信息
        return {
            code: 0,
            message: '查询成功',
            data: data.sort((a, b) => b.createdAt - a.createdAt), // 根据创建时间倒序排序
        };
    }

    // 根据 ID 查询问卷调查数据
    async findById(id: string): Promise<Response<SurveyData | undefined>> {
        const data = await this.store.read();
        const result = data.find((item) => item.id === id);
        if (result) {
            console.log(`查询问卷调查数据，id 为 ${id} 的数据存在`); // 控制台输出提示信息
            return {
                code: 0,
                message: '查询成功',
                data: result,
            };
        } else {
            console.log(`查询问卷调查数据，id 为 ${id} 的数据不存在`); // 控制台输出提示信息
            return {
                code: 404,
                message: '数据不存在',
                data: undefined,
            };
        }
    }
}

export { Survey as default, Response };
