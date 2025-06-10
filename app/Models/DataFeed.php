<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * 
 *
 * @property int $id
 * @property string|null $label
 * @property float|null $data
 * @property int|null $dataset_name
 * @property int $data_type
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder|DataFeed newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|DataFeed newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|DataFeed query()
 * @method static \Illuminate\Database\Eloquent\Builder|DataFeed whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|DataFeed whereData($value)
 * @method static \Illuminate\Database\Eloquent\Builder|DataFeed whereDataType($value)
 * @method static \Illuminate\Database\Eloquent\Builder|DataFeed whereDatasetName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|DataFeed whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|DataFeed whereLabel($value)
 * @method static \Illuminate\Database\Eloquent\Builder|DataFeed whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class DataFeed extends Model
{
    use HasFactory;

    /**
     * @var array
     */
    protected $guarded = ['id'];

    /**
     * @var string
     */
    protected $table = 'datafeeds';

    /**
     * Retrieves specific data types from the db
     *
     * @param int $dataType
     * @param string $field
     * @return mixed
     */
    public function getDataFeed(int $dataType, string $field = 'label', ?int $limit = null)
    {
        $query = $this->where('data_type', $dataType)
            ->where(function($q) use ($field){
                if ('label' == $field) {
                    $q->whereNotNull('label');
                }
            })->pluck($field)
            ->toArray();

        if (null !== $limit) {
            return array_slice($query, 0, $limit);
        }

        return $query;
    }

    /**
     * Counts a set of data based on the datatype
     *
     * @param int $dataType
     * @param int|null $limit
     * @return mixed
     */
    public function sumDataSet(int $dataType, ?int $dataset = null)
    {
        $query = $this->where('data_type', $dataType)
            ->where(function($q) use($dataset) {
                if (null !== $dataset) {
                    $q->where('dataset_name', $dataset);
                }
            })
            ->sum('data');

        return $query;
    }    
}
